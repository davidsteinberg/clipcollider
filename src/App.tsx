import "./App.css";
import * as Tone from "tone";
import { ChangeEventHandler, useRef, useState } from "react";

const clipNamesByType = {
  englishPhrase: "English phrase",
  spanishPhrase: "Spanish phrase",
  example1: "Example 1",
  example2: "Example 2",
  example3: "Example 3",
} as const;

type ClipType = keyof typeof clipNamesByType;

type Item = {
  displayName?: string;
  key: string;
  type?: "file" | "count1" | "count2";
};

const spanishPhraseLooped1: Item = {
  displayName: "Spanish phrase looped",
  key: "spanishPhrase",
  type: "count1",
};

const spanishPhraseLooped2: Item = {
  displayName: "Spanish phrase looped",
  key: "spanishPhrase",
  type: "count2",
};

const order: Item[] = [
  {
    displayName: "English phrase",
    key: "englishPhrase",
    type: "file",
  },
  {
    displayName: "Spanish phrase",
    key: "spanishPhrase",
    type: "file",
  },
  {
    key: "englishLoopInstructions",
  },
  spanishPhraseLooped1,
  {
    key: "englishExampleInstructions1",
  },
  {
    key: "spanishPhrase",
  },
  {
    displayName: "English example instructions part 2",
    key: "englishExampleInstructions2",
  },
  {
    key: "ejemplo1",
  },
  {
    displayName: "Example 1",
    key: "example1",
    type: "file",
  },
  {
    key: "ejemplo2",
  },
  {
    displayName: "Example 2",
    key: "example2",
    type: "file",
  },
  {
    key: "ejemplo3",
  },
  {
    displayName: "Example 3",
    key: "example3",
    type: "file",
  },
  {
    key: "englishPhrase",
  },
  spanishPhraseLooped2,
];

const App = () => {
  // Loop Counts
  const [loopCount1, setLoopCount1] = useState(3);
  const [loopCount2, setLoopCount2] = useState(3);
  const [spaces, setSpaces] = useState(Array.from(order).map(() => 0));

  const onLoopCount1Change: ChangeEventHandler = (event) => {
    const input = event.target as HTMLInputElement;
    setLoopCount1(Number(input.value));
  };

  const onLoopCount2Change: ChangeEventHandler = (event) => {
    const input = event.target as HTMLInputElement;
    setLoopCount2(Number(input.value));
  };

  // Refs
  const refs = {
    englishPhrase: useRef<HTMLInputElement>(null),
    spanishPhrase: useRef<HTMLInputElement>(null),
    example1: useRef<HTMLInputElement>(null),
    example2: useRef<HTMLInputElement>(null),
    example3: useRef<HTMLInputElement>(null),
  };

  const processFiles = () => {
    Tone.start();

    const fullOrder = [...order];
    const fullSpaces = [...spaces];
    const spanishPhraseSpace = spaces[1];

    for (let i = 1; i < loopCount2; i++) {
      fullOrder.splice(-1, 0, spanishPhraseLooped2);
      fullSpaces.splice(-1, 0, spanishPhraseSpace);
    }

    for (let i = 1; i < loopCount1; i++) {
      fullOrder.splice(3, 0, spanishPhraseLooped1);
      fullSpaces.splice(3, 0, spanishPhraseSpace);
    }

    const clips: Tone.Player[] = [];
    const output = new Tone.Volume(0).toDestination();

    const collide = () => {
      let index = -1;

      const mp4Type = "audio/mp4";
      const mp4TypeIsSupported = MediaRecorder.isTypeSupported(mp4Type);
      const mimeType = mp4TypeIsSupported ? mp4Type : undefined;
      let recorder: Tone.Recorder | undefined = new Tone.Recorder({ mimeType });

      output.connect(recorder);
      recorder.start();

      const stopRecording = async () => {
        if (recorder === undefined) {
          console.error("There is no recorder to stop!");
          return;
        }

        const blob = await recorder.stop();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a") as HTMLAnchorElement;
        a.style.display = "none";
        a.download = `clip.${mp4TypeIsSupported ? "m4a" : "webm"}`;
        a.href = url;
        a.click();

        // Clean up
        output.disconnect(recorder);
        recorder.dispose();
        recorder = undefined;
      };

      const playNext = () => {
        index++;

        if (index >= clips.length) {
          stopRecording();
          return;
        }

        const player = clips[index];
        player.onstop = () => {
          const secondsOfSilence = fullSpaces[index];
          setTimeout(playNext, secondsOfSilence * 1000);
        };

        player.start();
      };

      playNext();
    };

    let count = 7;
    const onload = () => {
      count -= 1;
      if (count === 0) {
        collide();
      }
    };

    for (const { key } of fullOrder) {
      let player: Tone.Player;

      if (key in refs) {
        const clipType = key as ClipType;
        const files = refs[clipType].current!.files;

        if (files === null || files.length === 0) {
          alert(`Missing ${clipNamesByType[clipType]}`);
          return;
        }

        const file = files[0];
        const url = URL.createObjectURL(file);

        player = new Tone.Player(url, onload);
      } else {
        const url = `audio/${key}.mp3`;
        player = new Tone.Player({
          url,
          onload,
          onerror(error) {
            alert(`Something went wrong for file ${url}! ${error}`);
            return;
          },
        });
      }

      player.connect(output);
      clips.push(player);
    }
  };

  return (
    <div className="App">
      <h2>The Clip Collider</h2>
      {order.map((item, index) => {
        const { displayName, key, type } = item;
        if (displayName === undefined) {
          return null;
        }

        return (
          <div key={index} className="row">
            <div className="column">{displayName}</div>
            <div className="column">
              {type === "file" ? (
                <input
                  ref={key in refs ? refs[key as ClipType] : null}
                  type="file"
                />
              ) : type === "count1" ? (
                <>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={loopCount1}
                    onChange={onLoopCount1Change}
                  />
                  times
                </>
              ) : type === "count2" ? (
                <>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={loopCount2}
                    onChange={onLoopCount2Change}
                  />
                  times
                </>
              ) : null}
            </div>
            <div className="column">
              then
              <input
                type="number"
                min={0}
                step={0.1}
                value={spaces[index]}
                onChange={(event) => {
                  const input = event.target as HTMLInputElement;
                  const newSpaces = [...spaces];
                  newSpaces[index] = Number(input.value);
                  setSpaces(newSpaces);
                }}
              />{" "}
              seconds of space
            </div>
          </div>
        );
      })}
      <div className="row collide">
        <div className="type"></div>
        <div className="file">
          <button onPointerDown={processFiles}>Collide</button>
        </div>
      </div>
    </div>
  );
};

export default App;
