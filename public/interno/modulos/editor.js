//import {default as Gabriel} from "./../gabriel.js";
var divMenuEdicao = null;
var nomeModulo = "Editor";
var botaoModulo = "✍";
var menuModulo = null;

async function carregarModulo() {
	atualizarLoading(1);
	//console.log(Gabriel);
	let parser = new DOMParser();
	let paginaModulo = await carregarPagina("./interno/modulos/editor.html");
	let conteudoModulo = parser.parseFromString(paginaModulo,"text/html");
	let novoEstilo = document.createElement("link");
	novoEstilo.rel = "stylesheet";
	novoEstilo.href = "interno/modulos/editor.css";
	novoEstilo.type = "text/css";
	document.head.appendChild(novoEstilo);
	divMenuEdicao = conteudoModulo.childNodes[0].childNodes[1].childNodes[0];
	divMenuEdicao = conteudoModulo.getElementsByTagName("div")[0];
	menuModulo = new Menu(nomeModulo,botaoModulo,divMenuEdicao);
	atualizarLoading(-1);
	return true;
}

//#region Funções GUI
var menuEdicao_botaoSelecionado = "";
function selecionarDuracao(argDuracao) {
	const keys = Object.keys(Duracoes);
	keys.forEach(chave => {
		//console.log(chave);
		if (argDuracao==Duracoes[chave]) {
			if (menuEdicao_botaoSelecionado!="") {
				document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.remove("selecionado");
			}
			menuEdicao_botaoSelecionado=chave;
			document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.add("selecionado");
		}
	});
}
//const randomKey = keys[Math.floor(Math.random() * keys.length)]; // Seleciona uma chave aleatória
	//console.log(Duracoes[randomKey]);
    //console.log({ [randomKey]: AlturasPx[randomKey] }); // Retorna a chave e o valor correspondente
	//return AlturasPx[randomKey];
//#endregion

document.body.addEventListener("keydown",(e)=>{
	//console.log({_});
	if (menuModulo.selecionado) {
		switch (e.code) {
			case "Numpad1":
				selecionarDuracao(Duracoes.SEMIFUSA);
				break;
			case "Numpad2":
				selecionarDuracao(Duracoes.FUSA);
				break;
			case "Numpad3":
				selecionarDuracao(Duracoes.SEMICOLCHEIA);
				break;
			case "Numpad4":
				selecionarDuracao(Duracoes.COLCHEIA);
				break;
			case "Numpad5":
				selecionarDuracao(Duracoes.SEMINIMA);
				break;
			case "Numpad6":
				selecionarDuracao(Duracoes.MINIMA);
				break;
			case "Numpad7":
				selecionarDuracao(Duracoes.SEMIBREVE);
				break;
			case "Numpad8":
				selecionarDuracao(Duracoes.BREVE);
				break;
			case "Escape":
				menuModulo.desselecionar();
				break;
			case "NumpadEnter":
			case "Enter":
				//TODO: Adicionar função de adicionar figura à divisão selecionada
				break;
		}
	}
});

carregarModulo();