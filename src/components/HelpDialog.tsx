import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Camera, X } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  const [view, setView] = useState<"menu" | "serie" | "part">("menu");

  const helpSerieHtml = `
<h3>
    <strong>Como encontrar o número de série na etiqueta do produto?</strong>
</h3>


<p>
    <br>
    <strong>Como encontrar o número de série na etiqueta do produto?</strong>
</p>
<p>
    Leia o código de barras ou QRCode da etiqueta, ou digite o número de série que consta na etiqueta
</p>
<figure class="image" data-ckbox-resource-id="AQ702PVsdtgl">
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/etiqueta.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS9ldGlxdWV0YS5qcGVnIiwiaWF0IjoxNzU0NzQ1Mzk0LCJleHAiOjIzODU0NjUzOTR9.ijHkdO8LurF1a3DgV6L6W6XP0j_5d7M8KMJHkJcaj5Y" type="image/webp" sizes="(max-width: 1220px) 100vw, 1220px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/AQ702PVsdtgl/images/1220.jpeg" width="1220" height="650"></picture>
</figure>
<p>
    <br>
    <strong>Como encontrar o número de série na interface web do produto?</strong><br>
    Menu&gt;Manutenção&gt;Informação do Sistema&gt; Informação do Dispositivo&gt; Núm. de série
</p>
<figure class="image" data-ckbox-resource-id="bB7o_z0-rhDk">
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/Inteface%20local.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS9JbnRlZmFjZSBsb2NhbC5qcGVnIiwiaWF0IjoxNzU0NzQ1NDkxLCJleHAiOjIzODU0NjU0OTF9.ii9vuHjUvdC2AKO-AYaFntwZn1V5EiDSNvgl75D8F8c" type="image/webp" sizes="(max-width: 1220px) 100vw, 1220px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/bB7o_z0-rhDk/images/1220.jpeg" width="1220" height="277"></picture>
</figure>
<p>
    <br>
    <strong>Como encontrar&nbsp;o número de série na interface local do dispositivo?</strong><br>
    Menu&gt;Manutenção&gt;Informação do Sistema&gt; Informação do Dispositivo&gt; Núm. de série
</p>
<figure class="image" data-ckbox-resource-id="Xee_SUVxMduy">
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/Interface%20web.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS9JbnRlcmZhY2Ugd2ViLmpwZWciLCJpYXQiOjE3NTQ3NDU1MzAsImV4cCI6MjM4NTQ2NTUzMH0.FHQO5Chghf9Tk-t0sp1BIJy9uEgGxRppwTuUVuFt42M" type="image/webp" sizes="(max-width: 1220px) 100vw, 1220px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/Xee_SUVxMduy/images/1220.jpeg" width="1220" height="285"></picture>
</figure>
<p>
    <br>
    <strong>Como entrontear o número de série pelo SADP?</strong><br>
    número de série do dispositivo<br>
    &nbsp;
</p>
<figure class="image" data-ckbox-resource-id="IsVBRBTwQ7r1">
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/sadp.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS9zYWRwLmpwZWciLCJpYXQiOjE3NTQ3NDU2MjUsImV4cCI6MjM4NTQ2NTYyNX0.BXT0TUsW-0VUN4qMJJRk7qhwKe_TPirXDI6cR2wPDcQ" type="image/webp" sizes="(max-width: 1220px) 100vw, 1220px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/IsVBRBTwQ7r1/images/1220.jpeg" width="1220" height="229"></picture>
</figure>
<br>
<p>
<h3>
 <strong>Caso não consiga encontrar clique em náo encontrei e digite as informações necesárias. </strong>
</h3>
</p>
`;

  const helpPartHtml = `
<h3 style="-webkit-text-stroke-width:0px;color:rgb(0, 0, 0);font-family:&quot;Times New Roman&quot;;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">
    <strong>Como encontrar o número de série na etiqueta do produto?</strong>
</h3>
<p style="-webkit-text-stroke-width:0px;color:rgb(0, 0, 0);font-family:&quot;Times New Roman&quot;;font-size:medium;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">
    <strong>Como encontrar o modelo do dispositivo na etiqueta do produto?</strong>
</p>
<p style="-webkit-text-stroke-width:0px;color:rgb(0, 0, 0);font-family:&quot;Times New Roman&quot;;font-size:medium;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">
    Digite o nome do produto que consta na etiqueta
</p>
<figure class="image" data-ckbox-resource-id="5iLBZhmUWafj">
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/etiqueta%20partnumber.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS9ldGlxdWV0YSBwYXJ0bnVtYmVyLmpwZyIsImlhdCI6MTc1NDc0Nzc1MCwiZXhwIjoyMzg1NDY3NzUwfQ.g1mh78D_khq4Wc2wcymV0fwwfNLAE0L3luTvsIWH6Sw" type="image/webp" sizes="(max-width: 1220px) 100vw, 1220px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/5iLBZhmUWafj/images/1220.jpeg" width="1220" height="650"></picture>
</figure>
<p>
    <strong style="-webkit-text-stroke-width:0px;color:rgb(0, 0, 0);font-family:&quot;Times New Roman&quot;;font-size:medium;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">Como encontrar o nome do produto na interface web do produto?</strong><br>
    <span style="color:rgb(0,0,0);font-family:&quot;Times New Roman&quot;;font-size:medium;"><span style="-webkit-text-stroke-width:0px;display:inline !important;float:none;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">Menu&gt;Manutenção&gt;Informação do Sistema&gt; Informação do Dispositivo&gt; Modelo</span></span>
</p>
<p>
    &nbsp;
</p>
<p>
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/web%20partnumber.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS93ZWIgcGFydG51bWJlci5wbmciLCJpYXQiOjE3NTQ3NDc4MTUsImV4cCI6MjM4NTQ2NzgxNX0.ilgVigzcMO0WCV4yi9Z28C_l_U2GQW-cz5xI2XoKnjs" type="image/webp" sizes="(max-width: 813px) 100vw, 813px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/e1M5YapIrlYN/images/813.png" data-ckbox-resource-id="e1M5YapIrlYN" width="813" height="431"></picture>
</p>
<p>
    &nbsp;
</p>
<p>
    <strong style="-webkit-text-stroke-width:0px;color:rgb(0, 0, 0);font-family:&quot;Times New Roman&quot;;font-size:medium;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">Como encontrar&nbsp;o modelo do dispositivo na interface local do dispositivo?</strong><br>
    <span style="color:rgb(0,0,0);font-family:&quot;Times New Roman&quot;;font-size:medium;"><span style="-webkit-text-stroke-width:0px;display:inline !important;float:none;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">Menu&gt;Manutenção&gt;Informação do Sistema&gt; Informação do Dispositivo&gt; Modelo</span></span>
</p>
<p>
    &nbsp;
</p>
<p>
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/locar%20partnumber.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS9sb2NhciBwYXJ0bnVtYmVyLnBuZyIsImlhdCI6MTc1NDc0Nzg1MiwiZXhwIjoyMzg1NDY3ODUyfQ.adoXw88sGP0iURFE4RJmzISVHV-J-aly__uT25CsmiM" type="image/webp" sizes="(max-width: 818px) 100vw, 818px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/P6U8y29DADa-/images/818.png" data-ckbox-resource-id="P6U8y29DADa-" width="818" height="413"></picture>
</p>
<p>
    &nbsp;
</p>
<p>
    <strong style="-webkit-text-stroke-width:0px;color:rgb(0, 0, 0);font-family:&quot;Times New Roman&quot;;font-size:medium;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">Como entrontear o modelo do dispositivo pelo SADP?</strong><br>
    <span style="color:rgb(0,0,0);font-family:&quot;Times New Roman&quot;;font-size:medium;"><span style="-webkit-text-stroke-width:0px;display:inline !important;float:none;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;orphans:2;text-align:start;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;">modelo do dispositivo</span></span>
</p>
<p>
    &nbsp;
</p>
<p>
    <picture><source srcset="https://vtafquzacrmemncgcjcc.supabase.co/storage/v1/object/sign/teste/SADP%20partnumber.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzYxYjA4Ni01ZDMzLTRjNzgtOWUyOS01ZWI5ZWVjOTM3ODYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0ZS9TQURQIHBhcnRudW1iZXIucG5nIiwiaWF0IjoxNzU0NzQ3ODc0LCJleHAiOjIzODU0Njc4NzR9.xjGyo9J0Oii8ACr4gptXBOtg--9Z5_0vkzJQRfXZC3g" type="image/webp" sizes="(max-width: 637px) 100vw, 637px"><img src="https://ckbox.cloud/0d04ce44b4f3b867ef30/assets/Fdb-FsGQpU3Y/images/637.png" data-ckbox-resource-id="Fdb-FsGQpU3Y" width="637" height="277"></picture>
</p>

<br>
<p>
<h3>
 <strong>Caso não consiga encontrar clique em náo encontrei e digite as informações necesárias. </strong>
</h3>
</p>
`;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setView("menu");
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Como procurar</DialogTitle>
        </DialogHeader>

        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="absolute right-3 top-3" aria-label="Fechar ajuda">
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>

        {view === "menu" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="h-auto py-6 flex-col"
              onClick={() => setView("serie")}
            >
              <QrCode className="h-10 w-10 mb-2" />
              Pesquisar por número de série
            </Button>
            <Button
              variant="secondary"
              className="h-auto py-6 flex-col"
              onClick={() => setView("part")}
            >
              <Camera className="h-10 w-10 mb-2" />
              Pesquisa por modelo de produto
            </Button>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: view === "serie" ? helpSerieHtml : helpPartHtml,
              }}
            />
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
