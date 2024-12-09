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
	menuModulo = new Menu(nomeModulo,botaoModulo,divMenuEdicao,atualizarEditor);
	divPartitura.appendChild(divEditor);
	atualizarEditor();
	selecionarDuracao(Duracoes.COLCHEIA);
	atualizarLoading(-1);
	menuModulo.selecionar();
	return true;
}

//#region Editor
var divEditor = document.createElement("div");
divEditor.classList.add("overlayEditor");
var imgCursorEditor = document.createElement("img");
imgCursorEditor.classList.add("cursor");
imgCursorEditor.src="#";
divEditor.appendChild(imgCursorEditor);


var alturaCursor = 0;
var cursorAdicionar = true;

function verificarEditorSelecionado() {
	let resultado = false;
	if (menuModulo.selecionado) {
		if (elementoSelecionado!=null) {
			if (elementoSelecionado instanceof Divisao) {
				resultado = true;
			}
		}
	}
	return resultado;
}

function atualizarEditor() {
	divEditor.style.display="none";
	if (verificarEditorSelecionado()) {
		divEditor.style.display="flex";
		divEditor.style.left = (elementoSelecionado.el.offsetLeft + elementoSelecionado.compasso.el.offsetLeft + elementoSelecionado.compasso.sistema.el.offsetLeft) + "px";
		divEditor.style.top = (elementoSelecionado.el.offsetTop + elementoSelecionado.compasso.el.offsetTop) + "px";
		divEditor.style.width = elementoSelecionado.el.offsetWidth + "px";
		divEditor.style.height = elementoSelecionado.el.offsetHeight + "px";
		imgCursorEditor.style.top = alturaCursor + "px";
		if (elementoSelecionado.figuras.length>0) {
			cursorAdicionar = false;
			imgCursorEditor.style.display = "none";
		} else {
			cursorAdicionar = true;
			imgCursorEditor.style.display = "block";
		}
	}
}

function adicionarFigura(argAltura = null) {
	if (verificarEditorSelecionado()) {
		if (duracaoSelecionada != null) {
			if (argAltura != null) {
				
				atualizarEditor();
			}
			let alturaNota = obterNotaAltura(alturaCursor,elementoSelecionado.compasso.clave);
			//console.log(alturaNota);
			elementoSelecionado.compasso.adicionarFigura(elementoSelecionado,duracaoSelecionada,false,alturaNota.nota,alturaNota.oitava);
			if (elementoSelecionado.compasso.obterTemposDivisoes() == elementoSelecionado.compasso.andamento[0]) {
				selecionarElemento(elementoSelecionado.compasso.compassoPosterior.divisoes[0]);
				if (elementoSelecionado.figuras.length > 0) {
					if (elementoSelecionado.figuras[0].sincopada!=null) {
						if (selecionarElemento.divisaoPosterior==null) {
							selecionarElemento(elementoSelecionado.compasso.compassoPosterior.divisoes[0]);
						} else {
							selecionarElemento(elementoSelecionado.divisaoPosterior);
						}
					}
				}
			} else {
				selecionarElemento(elementoSelecionado.divisaoPosterior);
			}
			elementoSelecionado.el.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center"
			});
		}
	}
}

function subirAlturaCursor() {
	alturaCursor -= alturaLinhasPautasPx;
	atualizarEditor();
}
function descerAlturaCursor() {
	alturaCursor += alturaLinhasPautasPx;
	atualizarEditor();
}
//#endregion




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
			imgCursorEditor.src="interno/imagens/figura" + obterImagemFiguraDuracao(duracaoSelecionada) + ".svg";
		}
	});
}
var selecionarElemento_ = selecionarElemento;
selecionarElemento = function(argElemento) {
	selecionarElemento_.apply(this,arguments);
	atualizarEditor();
}
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
				adicionarFigura();
				break;
			case "KeyA":
				adicionarFigura(Alturas.LA);
				break;
			case "KeyB":
				adicionarFigura(Alturas.SI);
				break;
			case "KeyC":
				adicionarFigura(Alturas.DO);
				break;
			case "KeyD":
				adicionarFigura(Alturas.RE);
				break;
			case "KeyE":
				adicionarFigura(Alturas.MI);
				break;
			case "KeyF":
				adicionarFigura(Alturas.FA);
				break;
			case "KeyG":
				adicionarFigura(Alturas.SOL);
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
					if (e.shiftKey) {
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
					} else {
						if (cursorAdicionar) {
							subirAlturaCursor();
						} else {
							elementoSelecionado.figuras[0].subirAltura();
						}
					}
				}
			} break;
			case "ArrowDown": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if (e.shiftKey) {
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
					} else {
						if (cursorAdicionar) {
							descerAlturaCursor();
						} else {
							elementoSelecionado.figuras[0].descerAltura();
						}
					}
				}
			} break;
		}
	}
});

carregarModulo();