//import {default as Gabriel} from "./../gabriel.js";
var divMenuEdicao = null;
var menuModulo = null;

var buttonPausa = null;

async function carregarModulo() {
	atualizarLoading(1);
	let nomeModulo = "Editor";
	let botaoModulo = "✍";
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
	buttonPausa = document.getElementById("menuEdicao_botaoPausa");
	atualizarEditor();
	selecionarDuracao(Duracoes.COLCHEIA);
	atualizarLoading(-1);
	//menuModulo.selecionar();
	return true;
}

//#region Editor
var divEditor = document.createElement("div");
divEditor.classList.add("overlayEditor");
var imgCursorEditor = document.createElement("img");
imgCursorEditor.classList.add("cursor");
imgCursorEditor.src="#";
divEditor.appendChild(imgCursorEditor);
for (let i = -alturaLinhasOitavasPx * 2; i <= alturaLinhasOitavasPx * 2; i += alturaLinhasPautasPx) {
	var divInserirNota = document.createElement("div");
	divInserirNota.classList.add("inserirNota");
	divInserirNota.style.height = alturaLinhasPautasPx + "px";
	divInserirNota.addEventListener("click",(e)=>{
		alturaCursor = i;
		adicionarFigura(i);
	});
	divEditor.appendChild(divInserirNota);
}


var alturaCursor = 0;
var cursorAdicionar = true;
var inserirPausa = false;

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
	console.log("Atualizando editor");
	divEditor.style.display="none";
	if (verificarEditorSelecionado()) {
		divEditor.style.display="flex";
		divEditor.style.left = (elementoSelecionado.el.offsetLeft + elementoSelecionado.compasso.el.offsetLeft + elementoSelecionado.compasso.sistema.el.offsetLeft) + "px";
		divEditor.style.top = (elementoSelecionado.el.offsetTop + elementoSelecionado.compasso.el.offsetTop) + "px";
		divEditor.style.width = elementoSelecionado.el.offsetWidth + "px";
		divEditor.style.height = elementoSelecionado.el.offsetHeight + "px";
		if (elementoSelecionado.figuras.length>0) {
			cursorAdicionar = false;
			imgCursorEditor.style.display = "none";
		} else {
			cursorAdicionar = true;
			imgCursorEditor.style.display = "block";
		}
		if (!cursorAdicionar) {
			selecionarDuracao(elementoSelecionado.figuras[0].figura, elementoSelecionado.figuras[0].pausa, false);
		}
		let nomeImagemCursor = obterImagemFiguraDuracao(duracaoSelecionada);
		
		if (inserirPausa) {
			imgCursorEditor.style.top = "0px";
			buttonPausa.classList.add("selecionado");
			Object.keys(Duracoes).forEach(duracao => {
				let nomeImagemFigura = "interno/imagens/figura" + duracao[0] + duracao.substring(1).toLowerCase() + "Pausa.svg";
				document.getElementById("menuEdicao_botao" + duracao).children[0].src = nomeImagemFigura;
			});
			nomeImagemCursor += "Pausa";
		} else {
			imgCursorEditor.style.top = alturaCursor + "px";
			buttonPausa.classList.remove("selecionado");
			Object.keys(Duracoes).forEach(duracao => {
				let nomeImagemFigura = "interno/imagens/figura" + duracao[0] + duracao.substring(1).toLowerCase() + ".svg";
				document.getElementById("menuEdicao_botao" + duracao).children[0].src = nomeImagemFigura;
			});
		}
		imgCursorEditor.src="interno/imagens/figura" + nomeImagemCursor + ".svg";
	}
}

function adicionarFigura(argAltura = null) {
	console.log("Adicionando figura " + argAltura);
	if (verificarEditorSelecionado()) {
		if (duracaoSelecionada != null) {
			if (typeof argAltura == "string") {
				let novaAltura = elementoSelecionado.compasso.alturaDo3Px;
				switch (argAltura) {
					case Alturas.SOL: novaAltura += alturaLinhasPautasPx * 3; break;
					case Alturas.LA: novaAltura += alturaLinhasPautasPx * 2; break;
					case Alturas.SI: novaAltura += alturaLinhasPautasPx; break;
					case Alturas.DO: break;
					case Alturas.RE: novaAltura -= alturaLinhasPautasPx; break;
					case Alturas.MI: novaAltura -= alturaLinhasPautasPx * 2; break;
					case Alturas.FA: novaAltura -= alturaLinhasPautasPx * 3; break;
				}
				//console.log(novaAltura - alturaCursor);
				while (novaAltura - alturaCursor > alturaLinhasPautasPx * 3) {
					//console.log("Muito longe pra baixo");
					novaAltura -= alturaLinhasOitavasPx;
				}
				while (alturaCursor - novaAltura > alturaLinhasPautasPx * 3) {
					//console.log("Muito longe pra cima");
					novaAltura += alturaLinhasOitavasPx;
				}
				alturaCursor = novaAltura;
				atualizarEditor();
			}
			let alturaNota = obterNotaAltura(alturaCursor,elementoSelecionado.compasso.clave);
			//console.log(alturaNota);
			if (cursorAdicionar) {
				elementoSelecionado.compasso.adicionarFigura(elementoSelecionado,duracaoSelecionada,inserirPausa,alturaNota.nota,alturaNota.oitava);
				selecionarElemento(elementoSelecionado.obterDivisaoPosterior());
			} else {
				if (argAltura != null) {
					elementoSelecionado.figuras[0].definirAltura(alturaNota.nota,alturaNota.oitava);
				}
				selecionarElemento(elementoSelecionado.obterDivisaoPosterior(false));
			}
			/*
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
			}*/
			elementoSelecionado.el.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center"
			});
		}
	}
}

function subirAlturaCursor() {
	if (cursorAdicionar) {
		alturaCursor -= alturaLinhasPautasPx;
	} else {
		elementoSelecionado.figuras[0].subirAltura();
	}
	atualizarEditor();
}
function descerAlturaCursor() {
	if (cursorAdicionar) {
		alturaCursor += alturaLinhasPautasPx;
	} else {
		elementoSelecionado.figuras[0].descerAltura();
	}
	atualizarEditor();
}
function avancarDivisaoCursor() {
	selecionarElemento(elementoSelecionado.obterDivisaoPosterior(false));
	elementoSelecionado.el.scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "center"
	});
}
function voltarDivisaoCursor() {
	selecionarElemento(elementoSelecionado.obterDivisaoAnterior(false));
	elementoSelecionado.el.scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "center"
	});
}
function subirPautaCursor() {
	let compassoAcima = elementoSelecionado.compasso.obterCompassoAcima();
	if (compassoAcima != null) {
		selecionarElemento(compassoAcima.obterPrimeiraDivisao(false));
		elementoSelecionado.el.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center"
		});
	}
}
function descerPautaCursor() {
	let compassoAbaixo = elementoSelecionado.compasso.obterCompassoAbaixo();
	if (compassoAbaixo != null) {
		selecionarElemento(compassoAbaixo.obterPrimeiraDivisao(false));
		elementoSelecionado.el.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center"
		});
	}
}
function avancarCompassoCursor() {
	if (elementoSelecionado.compasso.compassoPosterior != null) {
		selecionarElemento(elementoSelecionado.compasso.compassoPosterior.obterPrimeiraDivisao(false));
		elementoSelecionado.el.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center"
		});
	}
}
function voltarCompassoCursor() {
	if (elementoSelecionado.compasso.compassoAnterior != null) {
		selecionarElemento(elementoSelecionado.compasso.compassoAnterior.obterPrimeiraDivisao(false));
		elementoSelecionado.el.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center"
		});
	}
}
function alternarPausa(argDefinicao = null) {
	if (argDefinicao == null) {
		alternarPausa(!inserirPausa);
	} else {
		if (verificarEditorSelecionado()) {
			if (!cursorAdicionar) {
				elementoSelecionado.figuras[0].pausa = argDefinicao;
				elementoSelecionado.figuras[0].obterImagem();
				elementoSelecionado.figuras[0].atualizarElemento();
			}
		}
		inserirPausa = argDefinicao;
	}
	atualizarEditor();
}
//#endregion




//#region Funções GUI
var menuEdicao_botaoSelecionado = "";
var duracaoSelecionada = null;
function selecionarDuracao(argDuracao,argPausa = null, argReplicar = true) {
	console.log("Selecionando duração: " + argDuracao);
	const keys = Object.keys(Duracoes);
	keys.forEach(chave => {
		if (argDuracao==Duracoes[chave]) {
			if (menuEdicao_botaoSelecionado!="") {
				document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.remove("selecionado");
			}
			menuEdicao_botaoSelecionado=chave;
			duracaoSelecionada=argDuracao;
			document.getElementById("menuEdicao_botao"+menuEdicao_botaoSelecionado).classList.add("selecionado");
		}
	});
	if (argPausa != null) {
		inserirPausa = argPausa;
	}
	if (argReplicar) {
		atualizarEditor();
	}
}
var selecionarElemento_ = selecionarElemento;
selecionarElemento = function(argElemento) {
	console.log("Selecionando elemento");
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
			case "Numpad0":
				alternarPausa();
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
					if (!e.shiftKey) {
						avancarDivisaoCursor();
					} else {
						avancarCompassoCursor();
					}
				}
			} break;
			case "ArrowLeft": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if (!e.shiftKey) {
						voltarDivisaoCursor();
					} else {
						voltarCompassoCursor();
					}
				}
			} break;
			case "ArrowUp": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if (e.shiftKey) {
						subirPautaCursor();
					} else {
						subirAlturaCursor();
					}
				}
			} break;
			case "ArrowDown": {
				if (elementoSelecionado instanceof Divisao) {
					e.preventDefault();
					if (e.shiftKey) {
						descerPautaCursor();
					} else {
						descerAlturaCursor();
					}
				}
			} break;
		}
	}
});

carregarModulo();