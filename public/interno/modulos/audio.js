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
	atualizarLoading(-1);
	return true;
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