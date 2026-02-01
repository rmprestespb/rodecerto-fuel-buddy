import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's fuel records
    const { data: records, error: recordsError } = await supabase
      .from("fuel_records")
      .select("*, vehicles(name, brand, model, fuel_type)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20);

    if (recordsError) {
      throw new Error("Erro ao buscar registros");
    }

    if (!records || records.length < 2) {
      return new Response(
        JSON.stringify({
          suggestions: [
            {
              type: "info",
              title: "Continue registrando",
              description: "Registre mais abastecimentos para receber sugestões personalizadas de economia.",
              icon: "fuel"
            }
          ]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate statistics for the AI
    const avgKmPerLiter = records
      .filter((r: any) => r.km_per_liter)
      .reduce((acc: number, r: any, _, arr: any[]) => acc + r.km_per_liter / arr.length, 0);

    const avgPricePerLiter = records.reduce((acc: number, r: any, _, arr: any[]) => 
      acc + r.price_per_liter / arr.length, 0);

    const totalSpent = records.reduce((acc: number, r: any) => acc + r.total_cost, 0);
    const totalLiters = records.reduce((acc: number, r: any) => acc + r.liters, 0);

    const vehicleInfo = records[0]?.vehicles;
    const fuelTypes = [...new Set(records.map((r: any) => r.fuel_type))];

    // Prepare context for AI
    const analysisContext = {
      recordCount: records.length,
      avgKmPerLiter: avgKmPerLiter.toFixed(2),
      avgPricePerLiter: avgPricePerLiter.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      totalLiters: totalLiters.toFixed(2),
      vehicle: vehicleInfo ? `${vehicleInfo.brand || ""} ${vehicleInfo.model || vehicleInfo.name}`.trim() : "Veículo",
      fuelTypes: fuelTypes.join(", "),
      recentRecords: records.slice(0, 5).map((r: any) => ({
        date: r.date,
        km_per_liter: r.km_per_liter,
        price_per_liter: r.price_per_liter,
        liters: r.liters,
        fuel_type: r.fuel_type,
        station_name: r.station_name
      }))
    };

    const systemPrompt = `Você é um especialista em economia de combustível para veículos brasileiros. 
Analise os dados de abastecimento do usuário e forneça 2-3 sugestões práticas e personalizadas para economizar combustível.

Regras:
- Seja específico e baseie suas sugestões nos dados reais do usuário
- Use linguagem amigável e direta em português brasileiro
- Considere o tipo de combustível usado (gasolina, etanol, diesel, flex)
- Compare o consumo do veículo com médias esperadas
- Sugira melhorias práticas de direção, manutenção ou escolha de combustível
- Cada sugestão deve ter um título curto (máx 30 caracteres) e descrição (máx 100 caracteres)
- Classifique cada sugestão como: "economy" (dinheiro), "performance" (consumo), ou "tip" (dica geral)`;

    const userPrompt = `Dados do usuário:
- Veículo: ${analysisContext.vehicle}
- Média de consumo: ${analysisContext.avgKmPerLiter} km/L
- Preço médio pago: R$ ${analysisContext.avgPricePerLiter}/L
- Total gasto: R$ ${analysisContext.totalSpent}
- Litros abastecidos: ${analysisContext.totalLiters}L
- Combustíveis usados: ${analysisContext.fuelTypes}
- Número de registros: ${analysisContext.recordCount}

Últimos abastecimentos: ${JSON.stringify(analysisContext.recentRecords)}

Forneça sugestões personalizadas de economia.`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_fuel_suggestions",
              description: "Retorna sugestões de economia de combustível",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["economy", "performance", "tip"] },
                        title: { type: "string", description: "Título curto da sugestão (máx 30 chars)" },
                        description: { type: "string", description: "Descrição da sugestão (máx 100 chars)" }
                      },
                      required: ["type", "title", "description"],
                      additionalProperties: false
                    },
                    minItems: 2,
                    maxItems: 3
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_fuel_suggestions" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Erro ao gerar sugestões");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Resposta inválida da IA");
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("fuel-suggestions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
