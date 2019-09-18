# RiddimBox - Looper

WIP: A library that provides abtractions to record audio loops with support for multiple backends, currently it has support for `Tone.js`

## Requirements

This library needs you to provide:

- This library depends on [@riddimbox/transport](https://github.com/sgarza/riddimbox-transport)

## Usage

### Initialization

```javascript
import {
  Looper,
  ToneMediaRecorderProvider,
  RiddimBoxTransportProvider
} from "@riddimbox/looper";
// ... Transport/Metronome initialization
// const micInput = get user media mic input

const recorderProvider = new ToneMediaRecorderProvider(Tone, MediaRecorder);
const transportProvider = new RiddimBoxTransportProvider(Transport);

Looper.recorderProvider = recorderProvider;
Looper.transportProvider = transportProvider;

Looper.input = micInput;
```

## License

[MIT](LICENSE).
