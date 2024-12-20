var MIDI = null;

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

async function carregarModulo_audio() {
	atualizarLoading(1);
	Figura.prototype.executarNota = function() {
		console.log(this);
		let tempo = 60 / bpm;
		let duracaoFigura = this.figura * tempo;
		if (this.sincopa != null) {
			duracaoFigura += this.sincopa.figura * tempo;
		}
		playNoteWithMIDISynth(FrequenciasNotas[this.altura], 127, this.oitava, duracaoFigura);
	}
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
	executarPartitura();
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

function playNoteWithMIDISynth(note, velocity, oitava, argDuracao) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

	const somPiano = [0, 1, 0.5, 0.25, 0.125, 0.0625];

    oscillator.setPeriodicWave(context.createPeriodicWave(somPiano, new Float32Array(somPiano.length))); // Define a forma de onda da nota
	const frequencia = note * Math.pow(2, oitava - 3);
    oscillator.frequency.setValueAtTime(frequencia, context.currentTime); // Define a frequência da nota
    gainNode.gain.setValueAtTime(velocity / 127, context.currentTime); // Define a intensidade da nota
	//gainNode.gain.setValueAtTime(0, context.currentTime + 0.1); // Define a intensidade da nota
	gainNode.gain.linearRampToValueAtTime(0, context.currentTime + argDuracao); // Define a intensidade da nota

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + argDuracao); // Toca a nota por 1 segundo
	return true;
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

function executarCompassos() {
	let tempo = 60 / bpm;
	let sistemaAtual = sistemas[compassoExecucao];
	let duracaoCompasso = tempo * sistemaAtual.compassos[0].andamento[0];
	execucaoPartitura = setTimeout(executarCompassos, duracaoCompasso * 1000);
	//console.log(compassoExecucao);
	sistemaAtual.compassos.forEach(compasso => {
		let inicioDivisao = 0;
		let execucaoCompasso = null;
		compasso.divisoes.forEach(divisao => {
			let duracaoDivisao = tempo * divisao.tempos;
			//console.log(inicioDivisao);
			execucaoCompasso = setTimeout(() => {
				divisao.figuras.forEach(figura => {
					if ((!figura.pausa)
					&& (figura.sincopada == null)) {
						figura.executarNota();
					}
				});
			}, inicioDivisao * 1000);
			inicioDivisao += duracaoDivisao;
		});
	});
	compassoExecucao++;
}

carregarModulo_audio();