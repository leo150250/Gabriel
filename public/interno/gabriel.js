//#region Constantes e variáveis
const divPartitura = document.getElementById("partitura");
const divMenuTopo = document.getElementById("menuTopo");
const divMenuBase = document.getElementById("menuBase");
const divLoader = document.getElementById("loader");
const pLoader = document.getElementById("loaderTexto");
const divMenuPrincipal = document.getElementById("menuPrincipal");
const alturaCompassosPx = 150;
const alturaLinhasPautasPx = 6;
const alturaLinhasOitavasPx = alturaLinhasPautasPx*7;

var partes = [];
var parteSelecionada = -1;
var instrumentos = [];
var sistemas = [];
var numCompassos = 32;
var andamento = [4,4];
var tom = 0;
var elementoSelecionado = null;
var menus = [];
var dialogos = [];

var indiceCarregamento = 1;
//Exibir erro de inicialização caso aconteça algum erro durante o carregamento da página
function atualizarLoading(argContador=0) {
	indiceCarregamento+=parseInt(argContador);
	if (indiceCarregamento==0) {
		divLoader.style.opacity = 0;
		divLoader.style.pointerEvents="none";
	} else {
		//console.log("LOADING " + indiceCarregamento);
	}
}
function textoLoading(argTexto) {
	pLoader.innerHTML = argTexto;
}
window.addEventListener('error', function (e) {
	//console.log(e);
	textoLoading(e.message);
	atualizarLoading(1);
});
window.addEventListener('unhandledrejection', function (e) {
	//console.log(e);
	textoLoading(e.reason);
	atualizarLoading(1);
});
//#endregion




//#region Enums para tipos de figuras, durações e alturas
const Duracoes = {
	BREVE: 8,
	SEMIBREVE: 4,
	MINIMA: 2,
	SEMINIMA: 1,
	COLCHEIA: 0.5,
	SEMICOLCHEIA: 0.25,
	FUSA: 0.125,
	SEMIFUSA: 0.0625
};
const Alturas = {
	DO: 'C',
	RE: 'D',
	MI: 'E',
	FA: 'F',
	SOL: 'G',
	LA: 'A',
	SI: 'B'
};
const Claves = {
	SOL: 'G',
	FA: 'F',
	DO: 'C'
};
const Barras = {
	NENHUMA: "",
	SIMPLES: "Simples",
	DUPLA: "Dupla",
	INICIO: "Inicio",
	FIM: "Fim"
}
const AlturasPx = {
	LINHA5: -alturaLinhasPautasPx*4,
	ESPACO4: -alturaLinhasPautasPx*3,
	LINHA4: -alturaLinhasPautasPx*2,
	ESPACO3: -alturaLinhasPautasPx,
	LINHA3: 0,
	ESPACO2: alturaLinhasPautasPx,
	LINHA2: alturaLinhasPautasPx*2,
	ESPACO1: alturaLinhasPautasPx*3,
	LINHA1: alturaLinhasPautasPx*4
}
//#endregion




//#region Classes
class Dialogo {
	constructor(argNome,argTextoBotao,argElementoDialogo,argFuncaoCallback = null) {
		this.selecionado = false;
		this.elementoDialogo = argElementoDialogo;
		this.botao = document.createElement("button");
		this.botao.innerHTML = argTextoBotao;
		this.botao.title = argNome;
		this.botao.onclick = ()=>{
			exibirDialogo(this);
			this.botao.blur();
		}
		this.funcaoCallback = argFuncaoCallback;
		document.body.appendChild(this.elementoDialogo);
		dialogos.push(this);
	}
	selecionar() {
		if (!this.selecionado) {
			this.selecionado = true;
			this.elementoDialogo.showModal();
			if (this.funcaoCallback!=null) {
				this.funcaoCallback.apply(this,arguments);
			}
		}
	}
	desselecionar() {
		if (this.selecionado) {
			this.selecionado = false;
			this.elementoDialogo.close();
		}
	}
}

class Menu {
	constructor(argNome,argTextoBotao,argElementoMenu,argFuncaoCallback = null) {
		this.selecionado = false;
		this.elementoMenu = argElementoMenu;
		this.botao = document.createElement("button");
		this.botao.innerHTML = argTextoBotao;
		this.botao.title = argNome;
		this.botao.onclick = ()=>{
			exibirMenu(this);
			this.botao.blur();
		}
		this.funcaoCallback = argFuncaoCallback;
		divMenuBase.appendChild(this.elementoMenu);
		divMenuTopo.appendChild(this.botao);
		menus.push(this);
	}
	selecionar() {
		if (!this.selecionado) {
			this.selecionado = true;
			this.elementoMenu.classList.add("exibir");
			this.botao.classList.add("selecionado");
			if (this.funcaoCallback!=null) {
				this.funcaoCallback.apply(this,arguments);
			}
		}
	}
	desselecionar() {
		if (this.selecionado) {
			this.selecionado = false;
			this.elementoMenu.classList.remove("exibir");
			this.botao.classList.remove("selecionado");
			if (this.funcaoCallback!=null) {
				this.funcaoCallback.apply(this,arguments);
			}
		}
	}
}

class Figura {
	constructor(argDivisao,argFigura,argAltura,argOitava,argPausa = false) {
		this.divisao = argDivisao;
		this.figura = argFigura;
		this.sincopa = null;
		this.sincopada = null;
		this.altura = argAltura;
		//console.log(this.altura);
		this.oitava = argOitava;
		this.invertida = false;
		this.pausa = argPausa;
		this.alturaPx = this.obterAlturaNota();
		//this.alturaPx = obterAlturaAleatoria();
		this.el = document.createElement("img");
		this.el.classList.add("figura");
		this.el.style.width = "100px";
		this.el.style.height = "100px";
		this.obterImagem();
		//console.log(this.alturaPx);
		//this.el.src="#";
		this.divisao.el.appendChild(this.el);
		this.divisao.figuras.push(this);
		this.el_sincopa = document.createElement("img");
		this.el_sincopa.classList.add("sincopa");
		this.el_sincopa.src = "interno/imagens/sincopa.svg";
		this.el.onload = ()=>{
			this.atualizarElemento();
		}
		this.definirSincopa();
		this.divisao.el.appendChild(this.el_sincopa);
		this.atualizarElemento();
	}
	atualizar() {
		this.atualizarElemento();
		this.divisao.chamarAtualizacaoSistema();
	}
	atualizarElemento(argReplicar=true) {
		this.alturaPx = obterAlturaNota(this.altura,this.oitava,this.divisao.compasso.clave);
		if (this.sincopada!=null) {
			this.invertida = this.sincopada.invertida;
			if (argReplicar) {
				this.sincopada.atualizarElemento(false);
			}
		} else {
			this.invertida = (this.alturaPx < 0);
		}
		if (!this.pausa) {
			this.el.style.transform=this.invertida?"rotate(180deg)":"rotate(0deg)";
			this.el.style.top = this.alturaPx + "px";
		} else {
			this.el.style.transform="rotate(0deg)";
			this.el.style.top = "0px";
		}
		if (((this.alturaPx > alturaLinhasPautasPx * 5) || (this.alturaPx < alturaLinhasPautasPx * -5)) && (!this.pausa)) {
			this.el.style.backgroundImage="url('interno/imagens/linhasSuplementares.svg')";
			this.el.style.backgroundPositionY=((this.alturaPx * (this.invertida?1:-1)) % (alturaLinhasPautasPx * 2)) + "px";
			this.el.style.backgroundRepeat="no-repeat";
		} else {
			this.el.style.backgroundImage="none";
		}
		if (this.divisao.tempos!=this.figura) {
			//console.log("Atualizar imagem");
			this.obterImagem();
		}
		if (this.sincopa!=null) {
			//console.log("Atualizar síncopa");

			let calculoLarguraPx = ((parseInt(this.sincopa.el.x) - parseInt(this.el.x) - 10) / (window.devicePixelRatio));
			//console.log(this.sincopa.el.x + " - " + this.el.x + " = " + calculoLarguraPx);
			//let anguloSincopa = (Math.atan2(parseInt(this.sincopa.el.y) - parseInt(this.el.y),parseInt(this.sincopa.el.x) - parseInt(this.el.x)) * ((180.0 / Math.PI) - 90.0)) * (-1 * !this.invertida);
			let calculoAlturaPx = (parseInt(this.sincopa.el.y) - parseInt(this.el.y));
			let skewSincopa = calculoAlturaPx * Math.cos((calculoAlturaPx * Math.PI) / 180);
			//console.log(anguloSincopa);
			let transform = "";
			if (!this.invertida) {
				transform += " scaleY(-1)";
				skewSincopa *= -1;
			}
			transform += " skewY(" + ((skewSincopa)) + "deg)";
			
			this.el_sincopa.style.display="block";
			this.el_sincopa.style.left = (this.el.offsetLeft + 55) + "px";
			//this.el_sincopa.style.top = (this.el.offsetTop + 45 + ((anguloSincopa / 0.5))) + "px";
			this.el_sincopa.style.top = (this.el.offsetTop + 50) + (calculoAlturaPx / 2) + "px";
			this.el_sincopa.style.transform = transform;
			this.el_sincopa.style.width = (calculoLarguraPx) + "px";
			if (argReplicar) {
				this.sincopa.atualizarElemento(false);
			}
		}
	}
	obterImagem() {
		let imagem=obterImagemFiguraDuracao(this.figura);
		if (this.pausa) {
			imagem += "Pausa";
		}
		this.el.src="interno/imagens/figura" + imagem + ".svg";
	}
	obterAlturaNota() {
		return obterAlturaNota(this.altura,this.oitava,this.divisao.compasso.clave);
	}
	definirSincopa(argDestino=null) {
		if (argDestino==null) {
			this.el_sincopa.style.display="none";
			if (this.sincopa!=null) {
				this.sincopa.sincopada = null;
				this.sincopa.el.onload = null;
			}
			this.sincopa = null;
		} else {
			this.sincopa = argDestino;
			this.sincopa.sincopada = this;
			this.sincopa.el.onload = ()=>{
				this.atualizarElemento();
			}
			this.atualizarElemento();
		}
	}
	subirAltura() {
		switch (this.altura) {
			case Alturas.DO: this.altura = Alturas.RE; break;
			case Alturas.RE: this.altura = Alturas.MI; break;
			case Alturas.MI: this.altura = Alturas.FA; break;
			case Alturas.FA: this.altura = Alturas.SOL; break;
			case Alturas.SOL: this.altura = Alturas.LA; break;
			case Alturas.LA: this.altura = Alturas.SI; break;
			case Alturas.SI: this.altura = Alturas.DO; this.oitava++; break;
		}
		this.atualizarElemento();
	}
	descerAltura() {
		switch (this.altura) {
			case Alturas.DO: this.altura = Alturas.SI; this.oitava--; break;
			case Alturas.RE: this.altura = Alturas.DO; break;
			case Alturas.MI: this.altura = Alturas.RE; break;
			case Alturas.FA: this.altura = Alturas.MI; break;
			case Alturas.SOL: this.altura = Alturas.FA; break;
			case Alturas.LA: this.altura = Alturas.SOL; break;
			case Alturas.SI: this.altura = Alturas.LA; break;
		}
		this.atualizarElemento();
	}
	definirAltura(argAltura,argOitava) {
		this.altura=argAltura;
		this.oitava=argOitava;
		this.atualizarElemento();
	}
}

class Divisao {
	constructor(argCompasso,argTempos = 4,argDivisaoAnterior = null) {
		this.compasso = argCompasso;
		//console.log(this.compasso);
		this.tempos = argTempos;
		this.figuras = [];
		this.divisaoAnterior = argDivisaoAnterior;
		this.divisaoPosterior = null;
		if (this.divisaoAnterior != null) {
			this.divisaoAnterior.divisaoPosterior = this;
		}
		this.el = document.createElement("div");
		this.el.classList.add("divisao");
		this.el.addEventListener("click",(e)=>{
			switch (e.button) {
				case 0: selecionarElemento(this); break;
				default: console.log(e.button);
			}
		});
		this.atualizar();
		this.compasso.el.appendChild(this.el);
		this.compasso.divisoes.push(this);
	}
	dividir(argTempos) {
		//console.log("Dividir de " + this.tempos + " para " + argTempos);
		this.tempos = argTempos;
		let novosTempos = this.compasso.andamento[0] - this.compasso.obterTemposDivisoes() - this.tempos;
		let novaDivisao = null;
		if (novosTempos>0) {
			//console.log("Sobrou " + novosTempos + " tempos");
			novaDivisao = this.compasso.adicionarDivisao(novosTempos);
			this.divisaoPosterior = novaDivisao;
			novaDivisao.divisaoAnterior = this;
		}
		this.atualizar();
		return [this, novaDivisao];
	}
	adicionarFigura(argFigura,argAltura,argOitava,argPausa = false) {
		let novaFigura = new Figura(this,argFigura,argAltura,argOitava,argPausa);
		//console.log("Figura adicionada");
		return novaFigura;
	}
	atualizar() {
		this.el.style.flexBasis = ((this.tempos / this.compasso.andamento[0]) * 100) + "%";
		this.figuras.forEach(figura => {
			figura.atualizar();
		});
		this.chamarAtualizacaoSistema();
	}
	chamarAtualizacaoSistema() {
		this.compasso.chamarAtualizacaoSistema();
	}
	obterDivisaoPosterior(argDivisaoVazia = true) {
		if (this.divisaoPosterior != null) {
			if (argDivisaoVazia) {
				if (this.divisaoPosterior.figuras.length == 0) {
					return this.divisaoPosterior;
				} else {
					return this.divisaoPosterior.obterDivisaoPosterior(argDivisaoVazia);
				}
			} else {
				return this.divisaoPosterior;
			}
		} else {
			if (this.compasso.compassoPosterior != null) {
				return this.compasso.compassoPosterior.obterPrimeiraDivisao(argDivisaoVazia);
			} else {
				return null;
			}
		}
	}
	obterDivisaoAnterior(argDivisaoVazia = true) {
		if (this.divisaoAnterior != null) {
			if (argDivisaoVazia) {
				if (this.divisaoAnterior.figuras.length == 0) {
					return this.divisaoAnterior;
				} else {
					return this.divisaoAnterior.obterDivisaoAnterior(argDivisaoVazia);
				}
			} else {
				return this.divisaoAnterior;
			}
		} else {
			if (this.compasso.compassoAnterior != null) {
				return this.compasso.compassoAnterior.obterUltimaDivisao(argDivisaoVazia);
			} else {
				return null;
			}
		}
	}
}

class Compasso {
	constructor(argPauta,argCompassoAnterior = null,argSistema = null) {
		this.pauta = argPauta;
		this.sistema = argSistema;
		this.compassoAnterior = argCompassoAnterior;
		this.compassoPosterior = null;
		this.clave = this.pauta.clavePadrao;
		this.tom = tom;
		this.andamento = andamento;
		this.sistema = null;
		if (this.compassoAnterior!=null) {
			this.clave = this.compassoAnterior.clave;
			this.tom = this.compassoAnterior.tom;
			this.andamento = this.compassoAnterior.andamento;
			this.compassoAnterior.compassoPosterior = this;
		}
		this.alturaDo3Px = AlturasPx.ESPACO3 + alturaLinhasOitavasPx;
		switch (this.clave) {
			case Claves.SOL: this.alturaDo3Px = AlturasPx.ESPACO3 + alturaLinhasOitavasPx; break;
			case Claves.FA: this.alturaDo3Px = AlturasPx.ESPACO2 - alturaLinhasOitavasPx; break;
			case Claves.DO: this.alturaDo3Px = AlturasPx.LINHA3; break;
		}
		this.barraEsquerda = Barras.SIMPLES;
		this.barraDireita = Barras.SIMPLES;
		this.divisoes = [];
		this.el = document.createElement("div");
		this.el.classList.add("compasso");
		this.el.style.height = alturaCompassosPx+"px";
		this.el.addEventListener("click",(e)=>{
			let posXMouse = e.x;
			let posYMouse = e.y;
			/*
			console.log(posXMouse + "," + posYMouse);
			//console.log(e);
			this.divisoes.forEach(divisao => {
				let posXElemento = divisao.el.offsetLeft + this.el.offsetLeft + this.sistema.el.offsetLeft;
				console.log(posXElemento);
				if ((posXMouse > posXElemento)
				&& (posXMouse < posXElemento + divisao.el.offsetWidth)) {
					
					console.log(divisao);
				}
			});
			*/
		});
		this.el_cabecalho = document.createElement("div");
		this.el_cabecalho.classList.add("cabecalho");
		this.el.appendChild(this.el_cabecalho);
		this.el_clave = document.createElement("img");
		this.el_clave.classList.add("clave");
		this.el_clave.src="interno/imagens/clave"+this.clave+".svg";
		this.el.appendChild(this.el_clave);
		this.el_armadura = document.createElement("div");
		this.el_armadura.classList.add("armadura");
		this.el_armadura.style.display="none";
		this.atualizarArmadura(this.tom,true);
		this.el.appendChild(this.el_armadura);
		this.el_formula = document.createElement("div");
		this.el_formula.classList.add("formula");
		this.el_formula.style.display="none";
		this.el_formulaNumerador = document.createElement("div");
		this.el_formulaDenominador = document.createElement("div");
		this.el_formula.appendChild(this.el_formulaNumerador);
		this.el_formula.appendChild(this.el_formulaDenominador);
		this.el.appendChild(this.el_formula);
		this.el_barraEsquerda = document.createElement("img");
		this.el_barraEsquerda.classList.add("barra");
		this.el_barraEsquerda.style.left = "0px";
		this.el_barraEsquerda.style.width = "100px";
		this.el_barraEsquerda.src="interno/imagens/barra"+this.barraEsquerda+".svg";
		this.el.appendChild(this.el_barraEsquerda);
		this.el_barraDireita = document.createElement("img");
		this.el_barraDireita.classList.add("barra");
		this.el_barraDireita.style.right = "0px";
		this.el_barraDireita.style.width = "100px";
		this.el_barraDireita.src="interno/imagens/barra"+this.barraDireita+".svg";
		this.el.appendChild(this.el_barraDireita);
		this.adicionarDivisao(this.andamento[0]);
	}
	atualizar() {
		this.atualizarFormula();
		this.atualizarArmadura();
		this.el_cabecalho.innerHTML = this.pauta.instrumento.abreviatura+".";
		if (this.compassoAnterior==null) {
			this.el_formula.style.display="flex";
			this.el_armadura.style.display="block";
			this.atualizarBarraEsquerda();
			if (this.pauta.instrumento.pautas.length == 1) {
				this.el_cabecalho.style.display="block";
			} else {
				if (this.pauta == this.pauta.instrumento.pautas[0]) {
					this.el_cabecalho.style.display="block";
					this.el_cabecalho.style.height=(alturaCompassosPx*this.pauta.instrumento.pautas.length)+"px";
					this.el_cabecalho.style.marginTop=((alturaCompassosPx*this.pauta.instrumento.pautas.length)/2)+"px";
				} else {
					this.el_cabecalho.style.display="inline";
					this.el_cabecalho.innerHTML = "";
				}
			}
		} else {
			if (this.compassoAnterior.el.style.offsetTop == this.el.style.offsetTop) {
				this.el_cabecalho.style.display="none";
				if (this.compassoAnterior.clave == this.clave) {
					this.el_clave.style.display="none";
				}
				if ((this.andamento[0]==this.compassoAnterior.andamento[0]) && (this.andamento[1]==this.compassoAnterior.andamento[1])) {
					this.el_formula.style.display="none";
				}
				if (this.tom==this.compassoAnterior.tom) {
					this.el_armadura.style.display="none";
				}
			} else {
				this.atualizarBarraEsquerda();
				this.el_formula.style.display="flex";
				this.el_armadura.style.display="block";
			}
		}
		if (this.compassoPosterior==null) {
			this.atualizarBarraDireita(Barras.FIM);
		}
		this.divisoes.forEach(divisao => {
			divisao.atualizar();
		});
	}
	chamarAtualizacaoSistema() {
		if (this.sistema != null) {
			this.sistema.atualizar();
		}
	}
	atualizarBarraEsquerda(argBarra = Barras.NENHUMA) {
		this.barraEsquerda=argBarra;
		if (this.barraEsquerda == Barras.NENHUMA) {
			this.el_barraEsquerda.style.display = "none";
		} else {
			this.el_barraEsquerda.style.display = "block";
			this.el_barraEsquerda.src = "interno/imagens/barra" + this.barraEsquerda + ".svg";
		}
	}
	atualizarBarraDireita(argBarra = Barras.NENHUMA) {
		this.barraDireita=argBarra;
		if (this.barraDireita == Barras.NENHUMA) {
			this.el_barraDireita.style.display = "none";
		} else {
			this.el_barraDireita.style.display = "block";
			this.el_barraDireita.src = "interno/imagens/barra" + this.barraDireita + ".svg";
		}
	}
	atualizarFormula(argAndamento = null) {
		if (argAndamento!=null) {
			this.andamento = argAndamento;
		}
		this.el_formulaNumerador.innerHTML = this.andamento[0];
		this.el_formulaDenominador.innerHTML = this.andamento[1];
	}
	atualizarArmadura(argTom = null, argForce = false) {
		let alterado = false;
		if (argTom!=null) {
			if (argTom!=this.tom) {
				alterado = true;
			}
			this.tom = argTom;
		}
		if (alterado || argForce) {
			let acidente = this.tom>0?"sustenido":"bemol";
			let numAcidentes=Math.abs(this.tom);
			let posicaoAcidente = 0;
			let posicaoAcidenteLimite = 0;
			switch (this.clave) {
				case Claves.SOL:
					posicaoAcidente = (acidente=="sustenido"?AlturasPx.LINHA5:AlturasPx.LINHA3);
					if (acidente=="sustenido") {
						posicaoAcidenteLimite = AlturasPx.LINHA5 - alturaLinhasPautasPx;
					} else {
						posicaoAcidenteLimite = AlturasPx.LINHA5 + alturaLinhasPautasPx;
					}
					break;
				case Claves.FA:
					posicaoAcidente = (acidente=="sustenido"?AlturasPx.LINHA4:AlturasPx.LINHA2);
					posicaoAcidenteLimite = AlturasPx.LINHA5 + alturaLinhasPautasPx;
					break;
				case Claves.DO:
					posicaoAcidente = (acidente=="sustenido"?AlturasPx.ESPACO4:AlturasPx.ESPACO2);
					if (acidente=="sustenido") {
						posicaoAcidenteLimite = AlturasPx.LINHA5;
					} else {
						posicaoAcidenteLimite = AlturasPx.ESPACO4 - alturaLinhasPautasPx;
					}
					break;
			}
			while (this.el_armadura.firstChild) {
				this.el_armadura.removeChild(this.el_armadura.firstChild);
			}
			for (let i = 0; i < numAcidentes; i++) {
				let novoAcidente = document.createElement("img");
				novoAcidente.src = "interno/imagens/" + acidente + ".svg";
				novoAcidente.style.top=posicaoAcidente + "px";
				this.el_armadura.appendChild(novoAcidente);
				if (acidente=="sustenido") {
					posicaoAcidente -= alturaLinhasPautasPx*11;
				} else {
					posicaoAcidente -= alturaLinhasPautasPx*10;
				}
				while (posicaoAcidente < posicaoAcidenteLimite) {
					posicaoAcidente += alturaLinhasOitavasPx;
				}
			}
		}
	}
	adicionarDivisao(argTempos) {
		let novaDivisao = new Divisao(this,argTempos);
		return novaDivisao;
	}
	adicionarFigura(argDivisao,argFigura,argPausa = false,argAltura = Alturas.DO,argOitava = 4) {
		let divisao = null;
		let sobraFigura = 0;
		if (argDivisao == -1) {
			divisao = this.divisoes[this.divisoes.length-1];
		} else {
			if (typeof argDivisao == "number") {
				divisao = this.divisoes[argDivisao];
			} else if (argDivisao instanceof Divisao) {
				divisao = argDivisao;
			}
		}
		if (this.obterTemposDivisoes() < this.andamento[0]) {
			if (divisao.tempos > argFigura) {
				//console.log("Precisa dividir");
				let novasDivisoes = divisao.dividir(argFigura);
				divisao = novasDivisoes[0];
			}
			if (argFigura > divisao.tempos) {
				sobraFigura=argFigura - divisao.tempos;
				argFigura=divisao.tempos;
			}
			let notaAdicionada = divisao.adicionarFigura(argFigura,argAltura,argOitava,argPausa);
			if (sobraFigura>0) {
				notaAdicionada.definirSincopa(this.compassoPosterior.adicionarFigura(-1,sobraFigura,argPausa,argAltura,argOitava));
			}
			return notaAdicionada;
		} else {
			return this.compassoPosterior.adicionarFigura(-1,argFigura,argPausa,argAltura,argOitava);
		}
	}
	obterTemposDivisoes() {
		let tempos = 0;
		this.divisoes.forEach(divisao => {
			divisao.figuras.forEach(figura => {
				tempos += figura.figura;
			})
		});
		//console.log("Obteve " + tempos);
		return tempos;
	}
	obterPrimeiraDivisao(argDivisaoVazia = true) {
		if (argDivisaoVazia) {
			if (this.divisoes[0].figuras.length == 0) {
				return this.divisoes[0];
			} else {
				return this.divisoes[0].obterDivisaoPosterior(argDivisaoVazia);
			}
		} else {
			return this.divisoes[0];
		}
	}
	obterUltimaDivisao(argDivisaoVazia = true) {
		//console.log(argDivisaoVazia);
		if (argDivisaoVazia) {
			if (this.divisoes[this.divisoes.length - 1].figuras.length == 0) {
				return this.divisoes[this.divisoes.length - 1];
			} else {
				return this.divisoes[this.divisoes.length - 1].obterDivisaoAnterior(argDivisaoVazia);
			}
		} else {
			return this.divisoes[this.divisoes.length - 1];
		}
	}
	obterNumero() {
		let numero = 0;
		for (let i = 0; i < this.pauta.compassos.length; i++) {
			if (this.pauta.compassos[i] == this) {
				numero = i;
				break;
			}
		}
		return numero;
	}
	obterCompassoAcima() {
		if (this.pauta.pautaAnterior!=null) {
			return this.pauta.pautaAnterior.compassos[this.obterNumero()];
		} else {
			if (this.pauta.instrumento.instrumentoAnterior!=null) {
				return this.pauta.instrumento.instrumentoAnterior.obterUltimaPauta().compassos[this.obterNumero()];
			} else {
				return null;
			}
		}
	}
	obterCompassoAbaixo() {
		if (this.pauta.pautaPosterior!=null) {
			return this.pauta.pautaPosterior.compassos[this.obterNumero()];
		} else {
			if (this.pauta.instrumento.instrumentoPosterior!=null) {
				return this.pauta.instrumento.instrumentoPosterior.pautas[0].compassos[this.obterNumero()];
			} else {
				return null;
			}
		}
	}
}

class Pauta {
	constructor(argInstrumento,argClavePadrao,argPautaAnterior = null) {
		this.instrumento = argInstrumento;
		this.clavePadrao = argClavePadrao;
		this.compassos = [];
		this.pautaAnterior = argPautaAnterior;
		this.pautaPosterior = null;
		if (this.pautaAnterior != null) {
			this.pautaAnterior.pautaPosterior = this;
		}
		for (let i = 0; i < numCompassos; i++) {
			if (i > 0) {
				this.compassos.push(new Compasso(this,this.compassos[i-1]));
			} else {
				this.compassos.push(new Compasso(this));
			}
		}
	}
	definirInstrumento(argInstrumento) {
		this.instrumento = argInstrumento;
	}
	desenhar() {
		for (let i = 0; i < numCompassos; i++) {
			sistemas[i].el.appendChild(this.compassos[i].el);
			sistemas[i].compassos.push(this.compassos[i]);
			this.compassos[i].sistema = sistemas[i];
		}
	}
}

class Instrumento {
	constructor(argNome,argAbrev,argPautas=[],argInstrumentoAnterior = null,argNotacao = "comum",argTransposicao = 0) {
		this.nome = "";
		this.abreviatura = "";
		this.el_nome = document.createElement("div");
		this.atualizarNome(argNome, argAbrev);
		this.pautas = [];
		this.notacao = argNotacao;
		this.transposicao = argTransposicao;
		this.instrumentoAnterior = argInstrumentoAnterior;
		this.instrumentoPosterior = null;
		if (this.instrumentoAnterior != null) {
			//console.log(argInstrumentoAnterior);
			this.instrumentoAnterior.instrumentoPosterior = this;
		}
		for (let i = 0; i < argPautas.length; i++) {
			if (i > 0) {
				//console.log(argPautas[i]);
				this.adicionarPauta(argPautas[i],this.pautas[i-1]);
			} else {
				this.adicionarPauta(argPautas[i]);
			}
		}
		//argPautas.forEach(pauta => {
		//	this.adicionarPauta(pauta);
		//});
		new Parte(this.nome,[this]);
		instrumentos.push(this);
	}
	atualizarNome(argNome, argAbrev) {
		if (argNome!=this.nome) {
			this.nome = argNome;
			this.abreviatura =argAbrev;
			this.el_nome.innerHTML = this.nome;
		}
	}
	adicionarPauta(argPauta,argPautaAnterior=null) {
		let novaPauta = new Pauta(this,argPauta,argPautaAnterior);
		this.pautas.push(novaPauta);
		return novaPauta;
	}
	desenhar() {
		this.pautas.forEach(pauta => {
			pauta.desenhar();
		})
	}
	obterUltimaPauta() {
		return this.pautas[this.pautas.length - 1];
	}
	obterListagemPautas() {
		let listagemPautas = [];
		this.pautas.forEach(pauta=>{
			listagemPautas.push(pauta.clavePadrao);
		});
		return listagemPautas;
	}
}

class Sistema {
	constructor() {
		this.el = document.createElement("div");
		this.el.classList.add("sistema");
		this.compassos = [];
		sistemas.push(this);
		this.largura = this.el.offsetWidth;
	}
	atualizar() {
		//console.log("Atualizar sistema");
		if (this.el.offsetWidth != this.largura) {
			//console.log("Largura diferente!");
			this.largura = this.el.offsetWidth;
			this.compassos.forEach(compasso => {
				compasso.atualizar();
			});
		}
	}
}

class Parte {
	constructor(argNome,argInstrumentos = []) {
		this.nome = argNome;
		this.instrumentos = argInstrumentos;
		partes.push(this);
	}
}
//#endregion




//#region Funções gerais
function criarInstrumentoPadrao(tipo) {
    const pautas = [];
	var abreviatura = "";
    switch (tipo) {
        case 'Piano':
            pautas.push(Claves.SOL);
            pautas.push(Claves.FA);
			abreviatura = "Pno";
            break;
        case 'Flauta':
            pautas.push(Claves.SOL);
			abreviatura = "Flt";
            break;
        case 'Trombone':
            pautas.push(Claves.FA);
			abreviatura = "Trb";
            break;
        case 'Violino':
            pautas.push(Claves.SOL);
			abreviatura = "Vln";
            break;
        case 'Viola':
            pautas.push(Claves.DO);
			abreviatura = "Vla";
            break;
        case 'Violoncelo':
            pautas.push(Claves.FA);
			abreviatura = "Vlc";
            break;
        case 'Clarinete Bb':
            pautas.push(Claves.SOL);
			abreviatura = "Clr Bb";
            break;
        case 'Tuba':
            pautas.push(Claves.FA);
			abreviatura = "Tb";
            break;
        default:
            throw new Error('Tipo de instrumento padrão desconhecido');
    }
	var novoInstrumento;
	if (instrumentos.length == 0) {
    	novoInstrumento = new Instrumento(tipo, abreviatura, pautas);
	} else {
		novoInstrumento = new Instrumento(tipo, abreviatura, pautas, instrumentos[instrumentos.length - 1]);
	}
    return novoInstrumento;
}

function renderizarPartitura() {
	console.log("=== RENDERIZANDO PARTITURA");
	for (let i = 0; i < numCompassos; i++) {
		let novoSistema = new Sistema();
		divPartitura.appendChild(novoSistema.el);
	}
	if (parteSelecionada==-1) {
		instrumentos.forEach(instrumento => {
			instrumento.desenhar();
		});
	} else {
		partes.forEach(parte => {
			parte.instrumentos.forEach(instrumento => {
				instrumento.desenhar();
			});
		});
	}
	sistemas.forEach(sistema => {
		sistema.compassos.forEach(compasso => {
			compasso.atualizar();
		})
	});
}

function obterImagemFiguraDuracao(argDuracao) {
	let imagem = "";
	switch (argDuracao) {
		case 8: imagem = "Breve"; break;
		case 4: imagem = "Semibreve"; break;
		case 2: imagem = "Minima"; break;
		case 1: imagem = "Seminima"; break;
		case 0.5: imagem = "Colcheia"; break;
		case 0.25: imagem = "Semicolcheia"; break;
		case 0.125: imagem = "Fusa"; break;
		case 0.0625: imagem = "Semifusa"; break;
		default: throw new Error("Duração não-identificada: " + argDuracao);
	}
	return imagem;
}

function obterNotaAltura(argAlturaPx,argClave) {
	let alturaNota = null;
	let alturaOitava = 0;
	let nota = null;
	switch (argClave) {
		case Claves.DO:
			alturaNota = (((-argAlturaPx % alturaLinhasOitavasPx) / alturaLinhasPautasPx) + 7) % 7;
			alturaOitava = Math.floor(-argAlturaPx / alturaLinhasOitavasPx) + 3;
			break;
		case Claves.SOL:
			alturaNota=((((-argAlturaPx + (alturaLinhasPautasPx * 6)) % alturaLinhasOitavasPx) / alturaLinhasPautasPx) + 7) % 7;
			alturaOitava = Math.floor((-argAlturaPx + (alturaLinhasPautasPx * 6)) / alturaLinhasOitavasPx) + 3;
			break;
		case Claves.FA:
			alturaNota=((((-argAlturaPx + (alturaLinhasPautasPx)) % alturaLinhasOitavasPx) / alturaLinhasPautasPx) + 7) % 7;
			alturaOitava = Math.floor((-argAlturaPx + (alturaLinhasPautasPx)) / alturaLinhasOitavasPx) + 2;
			break;
	}
	nota = Alturas[Object.keys(Alturas)[alturaNota]];
	return {
		nota:nota,
		oitava:alturaOitava
	}
}
function obterAlturaNota(argNota,argOitava,argClave) {
	let alturaPx = 0;
	let alturaNota = null;
	switch (argClave) {
		case Claves.SOL: alturaPx = AlturasPx.ESPACO3 + alturaLinhasOitavasPx; break;
		case Claves.FA: alturaPx = AlturasPx.ESPACO2 - alturaLinhasOitavasPx; break;
		case Claves.DO: alturaPx = AlturasPx.LINHA3; break;
	}
	switch (argNota) {
		case Alturas.DO: alturaPx -= alturaLinhasPautasPx * 0; break;
		case Alturas.RE: alturaPx -= alturaLinhasPautasPx * 1; break;
		case Alturas.MI: alturaPx -= alturaLinhasPautasPx * 2; break;
		case Alturas.FA: alturaPx -= alturaLinhasPautasPx * 3; break;
		case Alturas.SOL: alturaPx -= alturaLinhasPautasPx * 4; break;
		case Alturas.LA: alturaPx -= alturaLinhasPautasPx * 5; break;
		case Alturas.SI: alturaPx -= alturaLinhasPautasPx * 6; break;
	}
	alturaPx -= alturaLinhasOitavasPx * (argOitava - 3);
	//console.log(indiceAltura);
	//console.log(alturaPx);
	return alturaPx;
}

function testarPartitura() {
	atualizarLoading(1);
	tom = 5;
	criarInstrumentoPadrao('Flauta');
	criarInstrumentoPadrao('Piano');
	criarInstrumentoPadrao('Violino');
	criarInstrumentoPadrao('Viola');
	criarInstrumentoPadrao('Violoncelo');
	renderizarPartitura();
	console.log(instrumentos);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.SEMINIMA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.MINIMA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.SEMINIMA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.MINIMA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.SEMIBREVE,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.SEMIBREVE,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.SEMINIMA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.COLCHEIA,false);
	instrumentos[0].pautas[0].compassos[0].adicionarFigura(-1,Duracoes.SEMINIMA,true);
	atualizarLoading(-1);
}

function obterAlturaAleatoria() {
    const keys = Object.keys(AlturasPx); // Obtém todas as chaves do objeto AlturasPx
    const randomKey = keys[Math.floor(Math.random() * keys.length)]; // Seleciona uma chave aleatória
	//console.log(AlturasPx[randomKey]);
    //return { [randomKey]: AlturasPx[randomKey] }; // Retorna a chave e o valor correspondente
	return AlturasPx[randomKey];
}

function selecionarElemento(argElemento) {
	if (argElemento!=null) {
		if (elementoSelecionado!=null) {
			elementoSelecionado.el.classList.remove("selecionado");
		}
		elementoSelecionado = argElemento;
		if (elementoSelecionado!=null) {
			elementoSelecionado.el.classList.add("selecionado");
		}
	} else {
		console.log("Não há elemento para selecionar!");
	}
	//console.log("Elemento selecionado");
	//console.log(argElemento);
}

async function carregarPagina(argPagina) {
	atualizarLoading(1);
	let novoFetch = await fetch(argPagina);
	let texto = await novoFetch.text();
	//console.log("Página carregada");
	atualizarLoading(-1);
	return texto;
}

async function importarModulo(argModulo) {
	atualizarLoading(1);
	var novoScript = document.createElement("script");
	novoScript.src = "interno/modulos/"+argModulo+".js";
	//var novoModulo = await import("./modulos/"+argModulo+".js");
	//await novoModulo.default();
	document.body.appendChild(novoScript);
	console.log("Módulo " + argModulo + " importado");
	atualizarLoading(-1);
}

function exibirMenu(argMenu) {
	if (argMenu.selecionado) {
		argMenu.desselecionar();
	} else {
		menus.forEach(menu => {
			menu.desselecionar();
		});
		argMenu.selecionar();
	}
}

function exibirDialogo(argDialogo) {
	if (typeof argDialogo == "object") {
		argDialogo.selecionar();
	} else if (typeof argDialogo == "string") {
		let achei = false;
		dialogos.forEach(dialogo=>{
			if (dialogo.elementoDialogo.id == argDialogo) {
				achei = true;
				exibirDialogo(dialogo);
			}
		});
		if (!achei) {
			console.log("Não encontrei o diálogo: " + argDialogo);
		}
	}
}

function fecharDialogo(argDialogo) {
	if (typeof argDialogo == "object") {
		argDialogo.desselecionar();
	} else if (typeof argDialogo == "string") {
		let achei = false;
		dialogos.forEach(dialogo=>{
			if (dialogo.elementoDialogo.id == argDialogo) {
				achei = true;
				fecharDialogo(dialogo);
			}
		});
		if (!achei) {
			console.log("Não encontrei o diálogo: " + argDialogo);
		}
	}
}

function exibirMenuPrincipal() {
	divMenuPrincipal.toggleAttribute("exibir");
}
//#endregion




//#region Event listeners
document.body.addEventListener("keydown",(e)=>{
	console.log(e.code);
	if (e.code == "F5") {
		location.reload();
	}
	if (elementoSelecionado instanceof Figura) {
		e.preventDefault();
		switch (e.code) {
			case "ArrowUp": elementoSelecionado.subirAltura(); break;
			case "ArrowDown": elementoSelecionado.descerAltura(); break;
		}
		elementoSelecionado.el.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "center"
		});
	}
});
document.body.onload = (e)=>{
	atualizarLoading(-1);
};
//#endregion


importarModulo("editor");
importarModulo("instrumentos");
//testarPartitura();