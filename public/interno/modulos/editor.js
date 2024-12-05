//import {default as Gabriel} from "./../gabriel.js";
var divMenuEdicao = null;
var nomeModulo = "Editor";
var botaoModulo = "✍";
var menuModulo = null;
var divEditor = document.createElement("div");
divEditor.classList.add("overlayEditor");

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
	menuModulo = new Menu(nomeModulo,botaoModulo,divMenuEdicao,atualizarEditor);
	divPartitura.appendChild(divEditor);
	atualizarEditor();
	atualizarLoading(-1);
	return true;
}

//#region Funções GUI
var menuEdicao_botaoSelecionado = "";
var duracaoSelecionada = null;
function selecionarDuracao(argDuracao) {
	const keys = Object.keys(Duracoes);
	keys.forEach(chave => {
		//console.log(chave);
		if (argDuracao==Duracoes[chave]) {
			if (menuEdicao_botaoSelecionado!="") {
				document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.remove("selecionado");
			}
			menuEdicao_botaoSelecionado=chave;
			duracaoSelecionada=argDuracao;
			document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.add("selecionado");
		}
	});
}
function atualizarEditor() {
	divEditor.style.display="none";
	if (menuModulo.selecionado) {
		if (elementoSelecionado!=null) {
			if (elementoSelecionado instanceof Divisao) {
				divEditor.style.display="block";
				divEditor.style.left = (elementoSelecionado.el.offsetLeft + elementoSelecionado.compasso.el.offsetLeft + elementoSelecionado.compasso.sistema.el.offsetLeft) + "px";
				divEditor.style.top = (elementoSelecionado.el.offsetTop + elementoSelecionado.compasso.el.offsetTop) + "px";
				divEditor.style.width = elementoSelecionado.el.offsetWidth + "px";
				divEditor.style.height = elementoSelecionado.el.offsetHeight + "px";
			}
		}
	}
}

var selecionarElemento_ = selecionarElemento;
selecionarElemento = function(argElemento) {
	selecionarElemento_.apply(this,arguments);
	atualizarEditor();
}
//#endregion

function adicionarFigura() {
	if (elementoSelecionado != null) {
		if (elementoSelecionado instanceof Divisao) {
			if (duracaoSelecionada != null) {
				elementoSelecionado.compasso.adicionarFigura(elementoSelecionado,duracaoSelecionada);
				if (elementoSelecionado.compasso.obterTemposDivisoes() == elementoSelecionado.compasso.andamento[0]) {
					selecionarElemento(elementoSelecionado.compasso.compassoPosterior.divisoes[0]);
				} else {
					selecionarElemento(elementoSelecionado.divisaoPosterior);
				}
			}
		}
	}
}

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
				adicionarFigura();
				break;
			case "ArrowRight": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if ((elementoSelecionado.divisaoPosterior!=null)
					&& (!e.shiftKey)) {
						selecionarElemento(elementoSelecionado.divisaoPosterior);
					} else {
						if (elementoSelecionado.compasso.compassoPosterior!=null) {
							selecionarElemento(elementoSelecionado.compasso.compassoPosterior.divisoes[0]);
						}
					}
					elementoSelecionado.el.scrollIntoView({
						behavior: "smooth",
						block: "center",
						inline: "center"
					});
				}
			} break;
			case "ArrowLeft": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if ((elementoSelecionado.divisaoAnterior!=null)
					&& (!e.shiftKey)) {
						selecionarElemento(elementoSelecionado.divisaoAnterior);
					} else {
						if (elementoSelecionado.compasso.compassoAnterior!=null) {
							if (e.shiftKey) {
								selecionarElemento(elementoSelecionado.compasso.compassoAnterior.divisoes[0]);
							} else {
								selecionarElemento(elementoSelecionado.compasso.compassoAnterior.obterUltimaDivisao());
							}
						}
					}
					elementoSelecionado.el.scrollIntoView({
						behavior: "smooth",
						block: "center",
						inline: "center"
					});
				}
			} break;
			case "ArrowUp": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if (elementoSelecionado.compasso.pauta.pautaAnterior!=null) {
						selecionarElemento(elementoSelecionado.compasso.pauta.pautaAnterior.compassos[elementoSelecionado.compasso.obterNumero()].divisoes[0]);
					} else {
						if (elementoSelecionado.compasso.pauta.instrumento.instrumentoAnterior!=null) {
							selecionarElemento(elementoSelecionado.compasso.pauta.instrumento.instrumentoAnterior.obterUltimaPauta().compassos[elementoSelecionado.compasso.obterNumero()].divisoes[0]);
						}
					}
					elementoSelecionado.el.scrollIntoView({
						behavior: "smooth",
						block: "center",
						inline: "center"
					});
				}
			} break;
			case "ArrowDown": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if (elementoSelecionado.compasso.pauta.pautaPosterior!=null) {
						selecionarElemento(elementoSelecionado.compasso.pauta.pautaPosterior.compassos[elementoSelecionado.compasso.obterNumero()].divisoes[0]);
					} else {
						if (elementoSelecionado.compasso.pauta.instrumento.instrumentoPosterior!=null) {
							selecionarElemento(elementoSelecionado.compasso.pauta.instrumento.instrumentoPosterior.pautas[0].compassos[elementoSelecionado.compasso.obterNumero()].divisoes[0]);
						}
					}
					elementoSelecionado.el.scrollIntoView({
						behavior: "smooth",
						block: "center",
						inline: "center"
					});
				}
			} break;
		}
	}
});

carregarModulo();