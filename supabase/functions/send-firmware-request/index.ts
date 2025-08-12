import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  nome?: string | null;
  telefone?: string | null;
  email?: string | null;
  produto_nome?: string | null; // Modelo do equipamento
  numero_serie?: string | null;
  descricao?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as EmailRequest;
    const to = (body.to || "").trim();
    if (!to) {
      return new Response(JSON.stringify({ error: "Missing 'to' address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

    const subject = "Solicitação de Firmware Pelo Portal";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Nova solicitação de firmware</h2>
        <p>Uma nova solicitação de firmware foi adicionada.</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
          <tbody>
            <tr><td style="padding: 6px 8px; font-weight: 600;">Nome</td><td style="padding: 6px 8px;">${body.nome || "-"}</td></tr>
            <tr><td style="padding: 6px 8px; font-weight: 600;">Telefone</td><td style="padding: 6px 8px;">${body.telefone || "-"}</td></tr>
            <tr><td style="padding: 6px 8px; font-weight: 600;">Email</td><td style="padding: 6px 8px;">${body.email || "-"}</td></tr>
            <tr><td style="padding: 6px 8px; font-weight: 600;">Modelo do equipamento</td><td style="padding: 6px 8px;">${body.produto_nome || "-"}</td></tr>
            <tr><td style="padding: 6px 8px; font-weight: 600;">Número de série</td><td style="padding: 6px 8px;">${body.numero_serie || "-"}</td></tr>
            <tr><td style="padding: 6px 8px; font-weight: 600;">Descrição</td><td style="padding: 6px 8px;">${body.descricao || "-"}</td></tr>
          </tbody>
        </table>
        <p style="margin-top: 16px; color: #666; font-size: 12px;">Email gerado automaticamente pelo Portal.</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Portal Firmware <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-firmware-request error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
