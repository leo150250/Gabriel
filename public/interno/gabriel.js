//#region Constantes e variáveis
const divPartitura = document.getElementById("partitura");
const divMenuTopo = document.getElementById("menuTopo");
const divMenuBase = document.getElementById("menuBase");
const divLoader = document.getElementById("loader");
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
var indiceCarregamento = 1;
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
class Menu {
	constructor(argNome,argTextoBotao,argElementoMenu) {
		this.selecionado = false;
		this.elementoMenu = argElementoMenu;
		this.botao = document.createElement("button");
		this.botao.innerHTML = argTextoBotao;
		this.botao.title = argNome;
		this.botao.onclick = ()=>{
			exibirMenu(this);
		}
		
		divMenuBase.appendChild(this.elementoMenu);
		divMenuTopo.appendChild(this.botao);

		menus.push(this);
	}
	selecionar() {
		this.selecionado = true;
		this.elementoMenu.classList.add("exibir");
		this.botao.classList.add("selecionado");
	}
	desselecionar() {
		this.selecionado = false;
		this.elementoMenu.classList.remove("exibir");
		this.botao.classList.remove("selecionado");
	}
}

class Figura {
	constructor(argDivisao,argFigura,argAltura,argOitava,argPausa = false) {
		this.divisao = argDivisao;
		this.figura = argFigura;
		this.sincopa = null;
		this.sincopada = null;
		this.altura = argAltura;
		this.invertida = false;
		this.alturaPx = this.divisao.compasso.pauta.alturaDo3Px;
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
	atualizarElemento(argReplicar=true) {
		this.el.style.top = this.alturaPx + "px";
		if (this.sincopada!=null) {
			this.invertida = this.sincopada.invertida;
			if (argReplicar) {
				this.sincopada.atualizarElemento(false);
			}
		} else {
			this.invertida = (this.alturaPx < 0);
		}
		this.el.style.transform=this.invertida?"rotate(180deg)":"rotate(0deg)";
		if ((this.alturaPx > alturaLinhasPautasPx * 5) || (this.alturaPx < alturaLinhasPautasPx * -5)) {
			this.el.style.backgroundImage="url('interno/imagens/linhasSuplementares.svg')";
			this.el.style.backgroundPositionY=((this.alturaPx * (this.invertida?1:-1)) % (alturaLinhasPautasPx * 2)) + "px";
			this.el.style.backgroundRepeat="no-repeat";
		} else {
			this.el.style.backgroundImage="none";
		}
		if (this.divisao.tempos!=this.figura) {
			console.log("Atualizar imagem");
			this.obterImagem();
		}
		if (this.sincopa!=null) {
			console.log("Atualizar síncopa");

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
		let imagem="";
		switch (this.figura) {
			case 4: imagem = "Semibreve"; break;
			case 2: imagem = "Minima"; break;
			case 1: imagem = "Seminima"; break;
			case 0.5: imagem = "Colcheia"; break;
		}
		if (imagem!="") {
			this.el.src="interno/imagens/figura" + imagem + ".svg";
		} else {
			console.log("Imagem diferente: " + imagem);
		}
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
		this.alturaPx -= alturaLinhasPautasPx;
		this.atualizarElemento();
	}
	descerAltura() {
		this.alturaPx += alturaLinhasPautasPx;
		this.atualizarElemento();
	}
}

class Divisao {
	constructor(argCompasso,argTempos = 4) {
		this.compasso = argCompasso;
		this.tempos = argTempos;
		this.figuras = [];
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
		}
		this.atualizar();
		return [this, novaDivisao];
	}
	adicionarFigura(argFigura,argAltura,argOitava) {
		let novaFigura = new Figura(this,argFigura,argAltura,argOitava);
		//console.log("Figura adicionada");
		return novaFigura;
	}
	atualizar() {
		this.el.style.flexBasis = ((this.tempos / this.compasso.andamento[0]) * 100) + "%";
	}
}

class Compasso {
	constructor(argPauta,argCompassoAnterior = null) {
		this.pauta = argPauta;
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
	adicionarFigura(argDivisao,argFigura,argPausa = false) {
		let divisao = null;
		let sobraFigura = 0;
		if (argDivisao == -1) {
			divisao = this.divisoes[this.divisoes.length-1];
		} else {
			divisao = this.divisoes[argDivisao];
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
			let notaAdicionada = divisao.adicionarFigura(argFigura,Alturas.DO,4);
			if (sobraFigura>0) {
				notaAdicionada.definirSincopa(this.compassoPosterior.adicionarFigura(-1,sobraFigura,argPausa));
			}
			return notaAdicionada;
		} else {
			return this.compassoPosterior.adicionarFigura(-1,argFigura,argPausa);
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
}

class Pauta {
	constructor(argInstrumento,argClavePadrao) {
		this.instrumento = argInstrumento;
		this.clavePadrao = argClavePadrao;
		this.compassos = [];
		for (let i = 0; i < numCompassos; i++) {
			if (i > 0) {
				this.compassos.push(new Compasso(this,this.compassos[i-1]));
			} else {
				this.compassos.push(new Compasso(this));
			}
		}
		this.alturaDo3Px = AlturasPx.ESPACO3 + alturaLinhasOitavasPx;
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
	constructor(argNome,argAbrev,argPautas=[]) {
		this.nome = "";
		this.abreviatura = "";
		this.el_nome = document.createElement("div");
		this.atualizarNome(argNome, argAbrev);
		this.pautas = [];
		this.transposicao = 0;
		argPautas.forEach(pauta => {
			this.adicionarPauta(pauta);
		});
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
	adicionarPauta(argPauta) {
		let novaPauta = new Pauta(this,argPauta);
		this.pautas.push(novaPauta);
	}
	desenhar() {
		this.pautas.forEach(pauta => {
			pauta.desenhar();
		})
	}
}

class Sistema {
	constructor() {
		this.el = document.createElement("div");
		this.el.classList.add("sistema");
		this.compassos = [];
		sistemas.push(this);
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
    const novoInstrumento = new Instrumento(tipo, abreviatura, pautas);
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
};

function selecionarElemento(argElemento) {
	if (elementoSelecionado!=null) {
		elementoSelecionado.el.classList.remove("selecionado");
	}
	elementoSelecionado = argElemento;
	if (elementoSelecionado!=null) {
		elementoSelecionado.el.classList.add("selecionado");
	}
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
	menus.forEach(menu => {
		menu.desselecionar();
	});
	argMenu.selecionar();
}

function exibirMenuPrincipal() {
	divMenuPrincipal.toggleAttribute("exibir");
}

function atualizarLoading(argContador=0) {
	indiceCarregamento+=parseInt(argContador);
	if (indiceCarregamento==0) {
		divLoader.style.opacity = 0;
		divLoader.style.pointerEvents="none";
	} else {
		//console.log("LOADING " + indiceCarregamento);
	}
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




testarPartitura();
importarModulo("editor");