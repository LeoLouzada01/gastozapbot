const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small:true});
});

client.on('ready', () => {
    console.log("Bot conectado!");
});

client.on('message', message => {

    if(message.fromMe) return;

    const texto = message.body.toLowerCase();
    const usuario = message.from;

    let banco = {};

    if(fs.existsSync("gastos.json")){
        banco = JSON.parse(fs.readFileSync("gastos.json"));
    }

    if(!banco[usuario]){
        banco[usuario] = [];
    }

    if(texto === "oi"){
        message.reply("👋 Envie um gasto assim:\n\nmercado 40\nuber 18\n\nOu digite RESUMO");
    }

    if(texto === "resumo"){

        const gastos = banco[usuario];

        if(gastos.length === 0){
            message.reply("Você ainda não registrou gastos.");
            return;
        }

        let total = 0;
        let lista = "📊 Seus gastos:\n\n";

        gastos.forEach(g => {
            lista += `${g.descricao} - R$${g.valor}\n`;
            total += g.valor;
        });

        lista += `\nTotal: R$${total}`;

        message.reply(lista);
        return;
    }

    const regex = /([a-zA-Z]+)\s(\d+)/;
    const match = texto.match(regex);

    if(match){

        const descricao = match[1];
        const valor = parseFloat(match[2]);

        banco[usuario].push({
            descricao,
            valor
        });

        fs.writeFileSync("gastos.json", JSON.stringify(banco,null,2));

        message.reply(`✅ Gasto salvo\n\n${descricao}\nR$${valor}`);
    }

});

client.initialize();