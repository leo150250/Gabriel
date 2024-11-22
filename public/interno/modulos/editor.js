import {default as Gabriel} from "./../gabriel.js";

//#region Funções GUI
var menuEdicao_botaoSelecionado = "";
export default function selecionarDuracao(argDuracao) {
	const keys = Object.keys(Gabriel.Duracoes);
	keys.forEach(chave => {
		//console.log(chave);
		if (argDuracao==Gabriel.Duracoes[chave]) {
			if (menuEdicao_botaoSelecionado!="") {
				document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.remove("selecionado");
			}
			menuEdicao_botaoSelecionado=chave;
			document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.add("selecionado");
		}
	});
    //const randomKey = keys[Math.floor(Math.random() * keys.length)]; // Seleciona uma chave aleatória
	//console.log(Duracoes[randomKey]);
    //console.log({ [randomKey]: AlturasPx[randomKey] }); // Retorna a chave e o valor correspondente
	//return AlturasPx[randomKey];
}
//#endregion

document.body.addEventListener("keydown",(e)=>{
	//console.log({_});
	if (e.code.startsWith("Numpad")) {
		switch (e.code) {
			case "Numpad1":
				selecionarDuracao(Gabriel.Duracoes.SEMIFUSA);
				break;
			case "Numpad2":
				selecionarDuracao(Gabriel.Duracoes.FUSA);
				break;
			case "Numpad3":
				selecionarDuracao(Gabriel.Duracoes.SEMICOLCHEIA);
				break;
			case "Numpad4":
				selecionarDuracao(Gabriel.Duracoes.COLCHEIA);
				break;
			case "Numpad5":
				selecionarDuracao(Gabriel.Duracoes.SEMINIMA);
				break;
			case "Numpad6":
				selecionarDuracao(Gabriel.Duracoes.MINIMA);
				break;
			case "Numpad7":
				selecionarDuracao(Gabriel.Duracoes.SEMIBREVE);
				break;
			case "Numpad8":
				selecionarDuracao(Gabriel.Duracoes.BREVE);
				break;
		}
	}
});


var divMenuEdicao = fetch("./interno/modulos/editor.html").then(response => response.text()).then(data => {
	let parser = new DOMParser();
	let conteudo = parser.parseFromString(data,"text/html");
	divMenuEdicao = conteudo.childNodes[0];
	console.log(divMenuEdicao);
});