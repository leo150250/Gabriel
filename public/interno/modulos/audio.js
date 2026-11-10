var MIDI = null;
var contextAudio = new (window.AudioContext || window.webkitAudioContext)();

const FrequenciasNotas = {
	C: 261.63,
	D: 293.66,
	E: 329.63,
	F: 349.23,
	G: 392.00,
	A: 440.00,
	B: 493.88
};

var compassoExecucao = 0;
var buttonExecutar = document.createElement("button");
buttonExecutar.onclick = executarPartitura;
buttonExecutar.innerHTML = "▶";
var buttonParar = document.createElement("button");
buttonParar.onclick = pararPartitura;
buttonParar.innerHTML = "⏹";
var divBarraPlayer = document.createElement("div");
divBarraPlayer.classList.add("barraPlayer");
var execucaoEmLoop = null;

async function carregarModulo_audio() {
	atualizarLoading(1);

	Figura.prototype.executarNota = function(argAmostra=false) {
		//console.log(this);
		let tempo = 60 / bpm;
		let duracaoFigura = this.figura * tempo;
		if (this.sincopa != null) {
			duracaoFigura += this.sincopa.figura * tempo;
		}
		playNoteWithMIDISynth(FrequenciasNotas[this.altura], 127, this.oitava, duracaoFigura);
	}
	var FiguraConstructor_audio = Figura.prototype.constructor;
	Figura.prototype.constructor = function() {
		FiguraConstructor_audio.apply(this, arguments);
		this.executarNota(true);
		console.log("AEEEHOOOOO");
	}

	let novoEstilo = document.createElement("link");
	novoEstilo.rel = "stylesheet";
	novoEstilo.href = "interno/modulos/audio.css";
	novoEstilo.type = "text/css";
	document.head.appendChild(novoEstilo);

	divMenuTopo.appendChild(buttonExecutar);
	divMenuTopo.appendChild(buttonParar);

	divPartitura.appendChild(divBarraPlayer);
	posicionarBarraPlayer(0);

	//Página de edição de áudio de instrumentos
	let parser = new DOMParser();
	let paginaEditorAudio = await carregarPagina("./interno/modulos/audio_editor.html");
	let conteudoEditorAudio = parser.parseFromString(paginaEditorAudio,"text/html");
	dialogEditorAudio = conteudoEditorAudio.childNodes[0].childNodes[1].childNodes[0];
	dialogoEditorAudio = new Dialogo("Editor de áudio",null,dialogEditorAudio,abrirEditAudio);
	h2InstrumentoEditorNome = document.getElementById("instrumentoEditorNome");
	tableListaCamadasEditorAudio = document.getElementById("listaCamadasEditorAudio");
	camadaSelecionada = null;
	listagemCamadas = [];
	inputDialogEditorAudio_CamadaID = document.getElementById("dialogEditorAudio_CamadaID");
	inputDialogEditorAudio_CamadaMult = document.getElementById("dialogEditorAudio_CamadaMult");
	inputDialogEditorAudio_CamadaGanho = document.getElementById("dialogEditorAudio_CamadaGanho");
	inputDialogEditorAudio_CamadaVibrato = document.getElementById("dialogEditorAudio_CamadaVibrato");
	inputDialogEditorAudio_CamadaVibratoFrequencia = document.getElementById("dialogEditorAudio_CamadaVibratoFrequencia");
	inputDialogEditorAudio_CamadaVibratoProfundidade = document.getElementById("dialogEditorAudio_CamadaVibratoProfundidade");
	inputDialogEditorAudio_CamadaVibratoAtraso = document.getElementById("dialogEditorAudio_CamadaVibratoAtraso");
	inputDialogEditorAudio_EnvATK = document.getElementById("dialogEditorAudio_EnvATK");
	inputDialogEditorAudio_EnvDEC = document.getElementById("dialogEditorAudio_EnvDEC");
	inputDialogEditorAudio_EnvSUS = document.getElementById("dialogEditorAudio_EnvSUS");
	inputDialogEditorAudio_EnvREL = document.getElementById("dialogEditorAudio_EnvREL");
	canvasDialogEditorAudio_Env = document.getElementById("dialogEditorAudio_Env");
	tableListaFramesCamada = document.getElementById("listaFramesCamada");
	headerTabelaFramesCamada = tableListaFramesCamada.rows[0];
	celulaAdicionarIndiceFrame = headerTabelaFramesCamada.cells[headerTabelaFramesCamada.cells.length - 1];
	botaoAdicionarIndiceFrame = celulaAdicionarIndiceFrame.querySelector("button");

	await navigator.requestMIDIAccess({sysex:true,software:true}).then(onMIDISuccess, onMIDIFailure);
	playNoteWithMIDISynth(FrequenciasNotas.C, 10, 3, 0.2);
	await new Promise(r => setTimeout(r, 100));
	playNoteWithMIDISynth(FrequenciasNotas.G, 10, 3, 0.2);
	await new Promise(r => setTimeout(r, 300));
	playNoteWithMIDISynth(FrequenciasNotas.E, 10, 3, 0.2);
	await new Promise(r => setTimeout(r, 100));
	//playNoteWithMIDISynth(FrequenciasNotas.D, 127);
	//playNoteWithMIDISynth(FrequenciasNotas.E, 127);
	//playNoteWithMIDISynth(FrequenciasNotas.F, 127);
	//playNoteWithMIDISynth(FrequenciasNotas.G, 127);
	//playNoteWithMIDISynth(FrequenciasNotas.A, 127);
	//playNoteWithMIDISynth(FrequenciasNotas.B, 127);
	carregarPosLoading(()=>{
		exibirDialogo(dialogoEditorAudio);
		exibirCamadaListagem(listagemCamadas[0]);
	});
	atualizarLoading(-1);
	return true;
}
class CamadaListagem {
	constructor(_camadaSom) {
		this.id = _camadaSom.id;
		this.multiplicador = _camadaSom.multiplicador;
		this.ganho = _camadaSom.ganho;
		this.vibrato = _camadaSom.vibrato ?? null;
		this.ativo = true;
		
		this.envelope = _camadaSom.envelope ?? _camadaSom.env ?? {
			ataque: 0,
			decaimento: 0,
			sustain: 0,
			release: 0
		};
		this.frames = _camadaSom.frames ?? {
			ataque: { real: [], imag: [] },
			decaimento: { real: [], imag: []},
			sustain: { real: [], imag: [] },
			release: { real: [], imag: [] }
		};

		this.el = document.createElement("tr");
		this.el.onclick = (e)=>{
			exibirCamadaListagem(this);
		}
		this.elAtivo = document.createElement("td");
		this.elCheckCamadaAtiva = document.createElement("input");
		this.elCheckCamadaAtiva.type = "checkbox";
		this.elCheckCamadaAtiva.checked = true;
		this.elCheckCamadaAtiva.onchange = (e)=>{
			this.ativo = this.elCheckCamadaAtiva.checked;
		}
		this.elAtivo.appendChild(this.elCheckCamadaAtiva);
		this.elId = document.createElement("td");
		this.elId.innerText = this.id;
		this.elMulti = document.createElement("td");
		this.elMulti.innerText = this.multiplicador;
		this.elGanho = document.createElement("td");
		this.elGanho.innerText = this.ganho;
		this.elAcoes = document.createElement("td");
		this.elButtonApagarCamada = document.createElement("button");
		this.elButtonApagarCamada.innerText = "🗑️";
		this.elAcoes.appendChild(this.elButtonApagarCamada);
		this.el.appendChild(this.elAtivo);
		this.el.appendChild(this.elId);
		this.el.appendChild(this.elMulti);
		this.el.appendChild(this.elGanho);
		this.el.appendChild(this.elAcoes);
		tableListaCamadasEditorAudio.appendChild(this.el);

		listagemCamadas.push(this);
	}
	selecionar() {
		this.el.classList.add("selecionado");
		//Atualiza os campos do formulário para os valores da camada selecionada, e habilita os campos para edição
		atualizarCamposEditCamada(this);
		atualizarTabelaFramesCamada(this);
		this.atualizarCanvas();
	}
	desselecionar() {
		this.el.classList.remove("selecionado");
		/*
		let headerTabelaPautas = tableListaPautas.childNodes[0];
		while (tableListaPautas.firstChild) {
			tableListaPautas.removeChild(tableListaPautas.firstChild);
		}
		tableListaPautas.appendChild(headerTabelaPautas);
		*/
	}
	atualizarCanvas() {
		if (!canvasDialogEditorAudio_Env) return;
		const ctx = canvasDialogEditorAudio_Env.getContext("2d");
		if (!ctx) return;
		const largura = canvasDialogEditorAudio_Env.width = canvasDialogEditorAudio_Env.parentElement.offsetWidth || canvasDialogEditorAudio_Env.width;
		const altura = canvasDialogEditorAudio_Env.height = canvasDialogEditorAudio_Env.clientHeight || canvasDialogEditorAudio_Env.height;
		ctx.clearRect(0, 0, largura, altura);
		if (!this.envelope || largura <= 0 || altura <= 0) return;

		const margem = Math.min(12, largura / 10, altura / 10);
		const baseY = altura - margem;
		const topoY = margem;
		const atk = Math.max(0, Number(this.envelope.ataque) || 0);
		const dec = Math.max(0, Number(this.envelope.decaimento) || 0);
		const sus = Math.max(0, Math.min(1, Number(this.envelope.sustain) || 0));
		const rel = Math.max(0, Number(this.envelope.release) || 0);
		const duracao = atk + dec + rel || 1;
		const x0 = margem;
		const escalaX = (largura - margem * 2) / duracao;
		const ySustain = baseY - (baseY - topoY) * sus;
		const xAtaque = x0 + atk * escalaX;
		const xDecaimento = xAtaque + dec * escalaX;
		const xRelease = largura - margem;

		ctx.beginPath();
		ctx.moveTo(xAtaque, baseY);
		ctx.lineTo(xAtaque, topoY);
		ctx.moveTo(xDecaimento, baseY);
		ctx.lineTo(xDecaimento, topoY);
		ctx.moveTo(xRelease - rel * escalaX, baseY);
		ctx.lineTo(xRelease - rel * escalaX, topoY);
		ctx.strokeStyle = "#b8d1eb";
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x0, baseY);
		ctx.lineTo(xAtaque, topoY);
		ctx.lineTo(xDecaimento, ySustain);
		ctx.lineTo(xRelease - rel * escalaX, ySustain);
		ctx.lineTo(xRelease, baseY);
		ctx.strokeStyle = "#2878c8";
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}
function atualizarTabelaFramesCamada(_camadaListagem) {
	if (!tableListaFramesCamada || !headerTabelaFramesCamada) return;
	while (tableListaFramesCamada.firstChild) {
		tableListaFramesCamada.removeChild(tableListaFramesCamada.firstChild);
	}
	//tableListaFramesCamada.appendChild(headerTabelaFramesCamada);

	const frames = _camadaListagem?.frames ?? {};
	const nomesFrames = Object.keys(frames);
	const numeroIndices = nomesFrames.reduce((maior, nome) => {
		const frame = frames[nome];
		const valores = Array.isArray(frame) ? frame : (frame?.real ?? frame?.indices ?? []);
		return Math.max(maior, valores.length);
	}, 0);

	const cabecalho = document.createElement("tr");
	const campoNome = headerTabelaFramesCamada.cells[0].cloneNode(true);
	cabecalho.appendChild(campoNome);
	for (let indice = 0; indice < numeroIndices; indice++) {
		const celula = document.createElement("th");
		celula.innerText = indice;
		cabecalho.appendChild(celula);
	}
	cabecalho.appendChild(celulaAdicionarIndiceFrame.cloneNode(true));
	tableListaFramesCamada.appendChild(cabecalho);

	for (const nome of nomesFrames) {
		const frame = frames[nome];
		const valores = Array.isArray(frame) ? frame : (frame?.real ?? frame?.indices ?? []);
		const imaginarios = Array.isArray(frame) ? [] : (frame?.imag ?? []);
		const linha = document.createElement("tr");
		const celulaNome = document.createElement("td");
		celulaNome.innerText = nome;
		linha.appendChild(celulaNome);
		for (let indice = 0; indice < numeroIndices; indice++) {
			const celula = document.createElement("td");
			const inputReal = document.createElement("input");
			inputReal.classList.add("block");
			inputReal.type = "number";
			inputReal.value = valores[indice] ?? "";
			inputReal.step = "0.01";
			inputReal.min = "0";
			inputReal.max = "1";
			inputReal.addEventListener("input", () => {
				valores[indice] = inputReal.value === "" ? "" : Number(inputReal.value);
			});
			const inputImag = document.createElement("input");
			inputImag.classList.add("block");
			inputImag.type = "number";
			inputImag.value = imaginarios[indice] ?? "";
			inputImag.step = "0.01";
			inputImag.min = "0";
			inputImag.max = "1";
			inputImag.addEventListener("input", () => {
				imaginarios[indice] = inputImag.value === "" ? "" : Number(inputImag.value);
			});
			celula.appendChild(inputReal);
			celula.appendChild(inputImag);
			linha.appendChild(celula);
		}
		linha.appendChild(document.createElement("td"));
		tableListaFramesCamada.appendChild(linha);
	}
}
function abrirEditAudio(_instrumento = null) {
	if (_instrumento === null) {
		_instrumento = jsonInstrumentos[8];
	}
	console.log(_instrumento);
	h2InstrumentoEditorNome.innerText = `${_instrumento.nome} (${_instrumento.abreviatura})`;
	if (_instrumento.som !== undefined) {
		listagemCamadas = [];
		let headerTabelaCamadas = tableListaCamadasEditorAudio.getElementsByTagName("tr")[0];
		while (tableListaCamadasEditorAudio.firstChild) {
			tableListaCamadasEditorAudio.removeChild(tableListaCamadasEditorAudio.firstChild);
		}
		tableListaCamadasEditorAudio.appendChild(headerTabelaCamadas);
		_instrumento.som.forEach(camadaSom=>{
			new CamadaListagem(camadaSom);
		});
	}
	/*
	//Categorias
	while (divInstrumentosListagemCategorias.firstChild) {
		divInstrumentosListagemCategorias.removeChild(divInstrumentosListagemCategorias.firstChild);
	}
	while (divInstrumentosListagem.firstChild) {
		divInstrumentosListagem.removeChild(divInstrumentosListagem.firstChild);
	}
	let categorias=[];
	jsonInstrumentos.forEach(instrumento => {
		instrumento.categoria.forEach(categoria => {
			if (!categorias.includes(categoria)) {
				categorias.push(categoria);
			}
		})
		gerarBotaoInstrumento(instrumento);
	});
	categorias.sort();
	categorias.forEach(categoria=>{
		let novaCategoria = document.createElement("button");
		novaCategoria.innerHTML = categoria;
		novaCategoria.onclick = (e)=>{
			if (categoriaSelecionada!=null) {
				categoriaSelecionada.classList.remove("selecionado");
			}
			categoriaSelecionada = novaCategoria;
			categoriaSelecionada.classList.add("selecionado");
			while (divInstrumentosListagem.firstChild) {
				divInstrumentosListagem.removeChild(divInstrumentosListagem.firstChild);
			}
			jsonInstrumentos.forEach(instrumento => {
				if (instrumento.categoria.includes(categoria)) {
					gerarBotaoInstrumento(instrumento);
				}
			});
		}
		divInstrumentosListagemCategorias.appendChild(novaCategoria);
	})
	*/
	console.log("EditAudio aberto");
}
function exibirCamadaListagem(_camadaListagem) {
	if (camadaSelecionada!=null) {
		camadaSelecionada.desselecionar();
	}
	camadaSelecionada = _camadaListagem;
	if (camadaSelecionada!=null) {
		camadaSelecionada.selecionar();
	}
}
function atualizarCamposEditCamada(_camadaListagem) {
	if (_camadaListagem == null) {
		inputDialogEditorAudio_CamadaID.value = "";
		inputDialogEditorAudio_CamadaMult.value = "";
		inputDialogEditorAudio_CamadaGanho.value = "";
		inputDialogEditorAudio_CamadaVibrato.checked = false;
		inputDialogEditorAudio_CamadaVibratoFrequencia.value = "";
		inputDialogEditorAudio_CamadaVibratoProfundidade.value = "";
		inputDialogEditorAudio_CamadaVibratoAtraso.value = "";
		inputDialogEditorAudio_EnvATK.value = "";
		inputDialogEditorAudio_EnvDEC.value = "";
		inputDialogEditorAudio_EnvSUS.value = "";
		inputDialogEditorAudio_EnvREL.value = "";
		inputDialogEditorAudio_CamadaID.disabled = true;
		inputDialogEditorAudio_CamadaMult.disabled = true;
		inputDialogEditorAudio_CamadaGanho.disabled = true;
		inputDialogEditorAudio_CamadaVibrato.disabled = true;
		inputDialogEditorAudio_CamadaVibratoFrequencia.disabled = true;
		inputDialogEditorAudio_CamadaVibratoProfundidade.disabled = true;
		inputDialogEditorAudio_CamadaVibratoAtraso.disabled = true;
		inputDialogEditorAudio_EnvATK.disabled = true;
		inputDialogEditorAudio_EnvDEC.disabled = true;
		inputDialogEditorAudio_EnvSUS.disabled = true;
		inputDialogEditorAudio_EnvREL.disabled = true;
		return;
	}

	inputDialogEditorAudio_CamadaID.value = _camadaListagem.id;
	inputDialogEditorAudio_CamadaMult.value = _camadaListagem.multiplicador;
	inputDialogEditorAudio_CamadaGanho.value = _camadaListagem.ganho;
	inputDialogEditorAudio_CamadaVibrato.checked = _camadaListagem.vibrato != null;
	inputDialogEditorAudio_CamadaVibratoFrequencia.value = _camadaListagem.vibrato?.freq ?? _camadaListagem.vibrato?.frequencia ?? 5.2;
	inputDialogEditorAudio_CamadaVibratoProfundidade.value = _camadaListagem.vibrato?.profundidadeCents ?? 18;
	inputDialogEditorAudio_CamadaVibratoAtraso.value = _camadaListagem.vibrato?.atraso ?? 0.15;
	inputDialogEditorAudio_EnvATK.value = _camadaListagem.envelope?.ataque ?? _camadaListagem.env?.atk ?? 0;
	inputDialogEditorAudio_EnvDEC.value = _camadaListagem.envelope?.decaimento ?? _camadaListagem.env?.dec ?? 0;
	inputDialogEditorAudio_EnvSUS.value = _camadaListagem.envelope?.sustain ?? _camadaListagem.env?.sus ?? 0;
	inputDialogEditorAudio_EnvREL.value = _camadaListagem.envelope?.release ?? _camadaListagem.env?.rel ?? 0;

	inputDialogEditorAudio_CamadaID.disabled = false;
	inputDialogEditorAudio_CamadaMult.disabled = false;
	inputDialogEditorAudio_CamadaGanho.disabled = false;
	inputDialogEditorAudio_CamadaVibrato.disabled = false;
	inputDialogEditorAudio_CamadaVibratoFrequencia.disabled = !_camadaListagem.vibrato;
	inputDialogEditorAudio_CamadaVibratoProfundidade.disabled = !_camadaListagem.vibrato;
	inputDialogEditorAudio_CamadaVibratoAtraso.disabled = !_camadaListagem.vibrato;
	inputDialogEditorAudio_EnvATK.disabled = false;
	inputDialogEditorAudio_EnvDEC.disabled = false;
	inputDialogEditorAudio_EnvSUS.disabled = false;
	inputDialogEditorAudio_EnvREL.disabled = false;

	inputDialogEditorAudio_CamadaMult.oninput = () => {
		if (camadaSelecionada == null) return;
		camadaSelecionada.multiplicador = Number(inputDialogEditorAudio_CamadaMult.value);
		camadaSelecionada.elMulti.innerText = camadaSelecionada.multiplicador;
	};
	inputDialogEditorAudio_CamadaGanho.oninput = () => {
		if (camadaSelecionada == null) return;
		camadaSelecionada.ganho = Number(inputDialogEditorAudio_CamadaGanho.value);
		camadaSelecionada.elGanho.innerText = camadaSelecionada.ganho;
	};
	inputDialogEditorAudio_CamadaVibrato.onchange = () => {
		if (camadaSelecionada == null) return;
		if (inputDialogEditorAudio_CamadaVibrato.checked) {
			camadaSelecionada.vibrato = camadaSelecionada.vibrato ?? {
				freq: 5.2,
				profundidadeCents: 18,
				atraso: 0.15
			};
		} else {
			camadaSelecionada.vibrato = null;
		}
		inputDialogEditorAudio_CamadaVibratoFrequencia.disabled = !camadaSelecionada.vibrato;
		inputDialogEditorAudio_CamadaVibratoProfundidade.disabled = !camadaSelecionada.vibrato;
		inputDialogEditorAudio_CamadaVibratoAtraso.disabled = !camadaSelecionada.vibrato;
		atualizarCamposEditCamada(camadaSelecionada);
	};
	inputDialogEditorAudio_CamadaVibratoFrequencia.oninput = () => {
		if (camadaSelecionada?.vibrato == null) return;
		camadaSelecionada.vibrato.freq = Number(inputDialogEditorAudio_CamadaVibratoFrequencia.value);
	};
	inputDialogEditorAudio_CamadaVibratoProfundidade.oninput = () => {
		if (camadaSelecionada?.vibrato == null) return;
		camadaSelecionada.vibrato.profundidadeCents = Number(inputDialogEditorAudio_CamadaVibratoProfundidade.value);
	};
	inputDialogEditorAudio_CamadaVibratoAtraso.oninput = () => {
		if (camadaSelecionada?.vibrato == null) return;
		camadaSelecionada.vibrato.atraso = Number(inputDialogEditorAudio_CamadaVibratoAtraso.value);
	};
	inputDialogEditorAudio_EnvATK.oninput = () => {
		if (camadaSelecionada == null) return;
		camadaSelecionada.envelope = camadaSelecionada.envelope ?? {};
		camadaSelecionada.envelope.ataque = Number(inputDialogEditorAudio_EnvATK.value);
		camadaSelecionada.atualizarCanvas();
	};
	inputDialogEditorAudio_EnvDEC.oninput = () => {
		if (camadaSelecionada == null) return;
		camadaSelecionada.envelope = camadaSelecionada.envelope ?? {};
		camadaSelecionada.envelope.decaimento = Number(inputDialogEditorAudio_EnvDEC.value);
		camadaSelecionada.atualizarCanvas();
	};
	inputDialogEditorAudio_EnvSUS.oninput = () => {
		if (camadaSelecionada == null) return;
		camadaSelecionada.envelope = camadaSelecionada.envelope ?? {};
		camadaSelecionada.envelope.sustain = Number(inputDialogEditorAudio_EnvSUS.value);
		camadaSelecionada.atualizarCanvas();
	};
	inputDialogEditorAudio_EnvREL.oninput = () => {
		if (camadaSelecionada == null) return;
		camadaSelecionada.envelope = camadaSelecionada.envelope ?? {};
		camadaSelecionada.envelope.release = Number(inputDialogEditorAudio_EnvREL.value);
		camadaSelecionada.atualizarCanvas();
	};

	

	/*
	argInstrumentoListagem.pautas.forEach(pauta => {
		tableListaPautas.appendChild(pauta.el);
	});
	*/
}

function executarSomCamadasEdit() {
	const camadas = Array.isArray(listagemCamadas) ? listagemCamadas : [];
	const agora = contextAudio.currentTime;
	const duracaoNota = 1;

	camadas.forEach(camada => {
		if (!camada.ativo) return;
		const harmonicos = camada.frames?.sustain ?? camada.frames?.ataque ?? {};
		const real = Array.isArray(harmonicos) ? harmonicos : (harmonicos.real ?? harmonicos.indices ?? []);
		const imag = Array.isArray(harmonicos) ? [] : (harmonicos.imag ?? []);
		const tamanho = Math.max(real.length, imag.length);
		if (!tamanho) return;

		const coeficientesReais = new Float32Array(tamanho + 1);
		const coeficientesImaginarios = new Float32Array(tamanho + 1);
		let temHarmonico = false;
		for (let i = 0; i < tamanho; i++) {
			const r = Number(real[i]) || 0;
			const im = Number(imag[i]) || 0;
			coeficientesReais[i + 1] = r;
			coeficientesImaginarios[i + 1] = im;
			if (r !== 0 || im !== 0) temHarmonico = true;
		}
		if (!temHarmonico) return;

		const oscilador = contextAudio.createOscillator();
		const ganho = contextAudio.createGain();
		const onda = contextAudio.createPeriodicWave(coeficientesReais, coeficientesImaginarios);
		const mult = Number(camada.multiplicador);
		const volume = Math.max(0, Number(camada.ganho) || 0);
		const envelope = camada.envelope ?? {};
		const ataque = Math.max(0, Number(envelope.ataque) || 0);
		const decaimento = Math.max(0, Number(envelope.decaimento) || 0);
		const sustain = Math.max(0, Math.min(1, Number(envelope.sustain) || 0));
		const release = Math.max(0, Number(envelope.release) || 0);
		const nivelSustain = volume * sustain;
		const instanteFimNota = agora + duracaoNota;
		const instanteFimSom = instanteFimNota + release;

		oscilador.setPeriodicWave(onda);
		oscilador.frequency.setValueAtTime(440 * (Number.isFinite(mult) && mult > 0 ? mult : 1), agora);
		ganho.gain.setValueAtTime(0, agora);
		ganho.gain.linearRampToValueAtTime(volume, agora + ataque);
		ganho.gain.linearRampToValueAtTime(nivelSustain, agora + ataque + decaimento);
		ganho.gain.setValueAtTime(nivelSustain, instanteFimNota);
		ganho.gain.linearRampToValueAtTime(0, instanteFimSom);
		oscilador.connect(ganho);
		ganho.connect(contextAudio.destination);

		const vibrato = camada.vibrato ?? {};
		const frequenciaVibrato = Number(vibrato.frequencia ?? vibrato.freq);
		const profundidadeVibrato = Number(vibrato.profundidadeCents) || 0;
		const atrasoVibrato = Math.max(0, Number(vibrato.atraso) || 0);
		const instanteInicioVibrato = agora + atrasoVibrato;
		if (Number.isFinite(frequenciaVibrato) && frequenciaVibrato > 0
			&& Number.isFinite(profundidadeVibrato) && profundidadeVibrato > 0
			&& instanteInicioVibrato < instanteFimNota) {
			const osciladorVibrato = contextAudio.createOscillator();
			const ganhoVibrato = contextAudio.createGain();
			const duracaoEntradaVibrato = Math.min(0.08, instanteFimNota - instanteInicioVibrato);

			osciladorVibrato.type = "sine";
			osciladorVibrato.frequency.setValueAtTime(frequenciaVibrato, agora);
			ganhoVibrato.gain.setValueAtTime(0, agora);
			ganhoVibrato.gain.setValueAtTime(0, instanteInicioVibrato);
			ganhoVibrato.gain.linearRampToValueAtTime(profundidadeVibrato, instanteInicioVibrato + duracaoEntradaVibrato);
			if (release > 0) {
				ganhoVibrato.gain.setValueAtTime(profundidadeVibrato, instanteFimNota);
				ganhoVibrato.gain.linearRampToValueAtTime(0, instanteFimSom);
			}

			osciladorVibrato.connect(ganhoVibrato);
			ganhoVibrato.connect(oscilador.detune);
			osciladorVibrato.start(agora);
			osciladorVibrato.stop(instanteFimSom);
		}

		oscilador.start(agora);
		oscilador.stop(instanteFimSom);
	});
}

function alternarExecucaoLoopCamadasEdit() {
	if (execucaoEmLoop === null) {
		execucaoEmLoop = setInterval(executarSomCamadasEdit,1000);
		executarSomCamadasEdit();
	} else {
		clearInterval(execucaoEmLoop);
		execucaoEmLoop = null;
	}
}

function onMIDISuccess(midiAccess) {
	console.log('MIDI Access Object', midiAccess);
	MIDI = midiAccess;
	listInputsAndOutputs(MIDI);
	listarSaidasMIDI();
}
function onMIDIFailure() {
	console.log('Could not access your MIDI devices.');
}
function listarSaidasMIDI() {
	var outputs = MIDI.outputs.values();
	for (var output = outputs.next(); output && !output.done; output = outputs.next()) {
		console.log(output.value);
	}
}
function sendMiddleC(portID) {
	const noteOnMessage = [0x90, 60, 0x7f]; // note on, middle C, full velocity
	const output = MIDI.outputs.get(portID);
	output.send(noteOnMessage); // sends the message
}  

var notasEmExecucao = [];
function playNoteWithMIDISynth(note, velocity, oitava, argDuracao) {
    const oscillator = contextAudio.createOscillator();
    const gainNode = contextAudio.createGain();

	const somOnda = [0, 1, 0.5, 0.25, 0.125, 0.0625]; //Piano

    oscillator.setPeriodicWave(contextAudio.createPeriodicWave(somOnda, new Float32Array(somOnda.length))); // Define a forma de onda da nota
	let frequencia = note * Math.pow(2, oitava - 3);
    oscillator.frequency.setValueAtTime(frequencia, contextAudio.currentTime); // Define a frequência da nota
    gainNode.gain.setValueAtTime(velocity / 127, contextAudio.currentTime); // Define a intensidade da nota
	gainNode.gain.linearRampToValueAtTime(0, contextAudio.currentTime + argDuracao); // Define a intensidade da nota

    oscillator.connect(gainNode);
    gainNode.connect(contextAudio.destination);

    oscillator.start();
    oscillator.stop(contextAudio.currentTime + argDuracao); // Toca a nota por 1 segundo
	notasEmExecucao.push(oscillator);
	setTimeout((e) => {
		console.log("Parou!");
		notasEmExecucao.forEach((nota, index) => {
			if (nota === oscillator) {
				notasEmExecucao.splice(index, 1);
			}
		});
	}, argDuracao * 1000);
	return oscillator;
}

function obterAcessoMIDI() {
	navigator.permissions.query({name: "midi", sysex: true}).then(function(result) {
		if (result.state === "granted") {
			console.log("Permission to use MIDI granted");
		} else if (result.state === "prompt") {
			console.log("Permission to use MIDI is prompt");
		} else {
			console.log("Permission to use MIDI denied");
		}
	});
}

function listInputsAndOutputs(midiAccess) {
	for (const entry of midiAccess.inputs) {
	  const input = entry[1];
	  console.log(
		`Input port [type:'${input.type}']` +
		  ` id:'${input.id}'` +
		  ` manufacturer:'${input.manufacturer}'` +
		  ` name:'${input.name}'` +
		  ` version:'${input.version}'`,
	  );
	}
  
	for (const entry of midiAccess.outputs) {
	  const output = entry[1];
	  console.log(
		`Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
	  );
	}
  }  

var execucaoPartitura = null;
function executarPartitura() {	
	compassoExecucao = 0;
	//Calcular o BPM da música com base no valor da variável tempo:
	executarCompassos();
}

var execucoesCompasso = [];
function executarCompassos() {
	let tempo = 60 / bpm;
	let sistemaAtual = sistemas[compassoExecucao];
	let duracaoCompasso = tempo * sistemaAtual.compassos[0].andamento[0];
	execucaoPartitura = setTimeout(executarCompassos, duracaoCompasso * 1000);
	let posicaoInicialBarra = posicionarBarraPlayer(compassoExecucao);
	divBarraPlayer.style.transitionDuration = duracaoCompasso + "s";
	//Obtém a largura de cada divisão do compasso do sistema atual:
	let larguraCompasso = 0;
	sistemaAtual.compassos[0].divisoes.forEach(divisao => {
		larguraCompasso += divisao.el.offsetWidth;
	});
	divBarraPlayer.style.left = (posicaoInicialBarra + larguraCompasso) + "px";
	//console.log(compassoExecucao);
	execucoesCompasso = [];
	sistemaAtual.compassos.forEach(compasso => {
		let inicioDivisao = 0;
		compasso.divisoes.forEach(divisao => {
			let duracaoDivisao = tempo * divisao.tempos;
			//console.log(inicioDivisao);
			execucoesCompasso.push(setTimeout(() => {
				divisao.figuras.forEach(figura => {
					if ((!figura.pausa)
					&& (figura.sincopada == null)) {
						figura.executarNota();
					}
				});
			}, inicioDivisao * 1000));
			inicioDivisao += duracaoDivisao;
		});
	});
	compassoExecucao++;
}

function pararPartitura() {
	posicionarBarraPlayer(0);
	clearTimeout(execucaoPartitura);
	execucoesCompasso.forEach(execucaoCompasso=>{
		clearTimeout(execucaoCompasso);
	});
	notasEmExecucao.forEach(notaEmExecucao=>{
		notaEmExecucao.stop();
	});
	notasEmExecucao=[];
}

function posicionarBarraPlayer(argSistema) {
	//Obtém o elemento do sistema de argSistema:
	let sistemaAtual = sistemas[argSistema];
	//Posiciona o divBarraPlayer no início do sistema:
	let posicaoX = 0;
	posicaoX += sistemaAtual.el.offsetLeft;
	posicaoX += sistemaAtual.compassos[0].el.offsetLeft;
	posicaoX += sistemaAtual.compassos[0].obterPrimeiraDivisao(false).el.offsetLeft;
	console.log(posicaoX);
	divBarraPlayer.style.transitionDuration = "0s";
	divBarraPlayer.style.left = posicaoX + "px";
	divBarraPlayer.style.top = sistemaAtual.el.y + "px";
	divBarraPlayer.style.height = sistemaAtual.el.offsetHeight + "px";
	return posicaoX;
}

carregarModulo_audio();