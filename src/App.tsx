import "./App.css";
import * as Tone from "tone";
import { useRef, useState } from "react";

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
  rate?: number;
  space?: number;
};

const order: Item[] = [
  {
    key: "theSpanishPhrase",
  },
  {
    displayName: "Spanish phrase",
    key: "spanishPhrase",
  },
  {
    key: "wouldBeSimilarToSaying",
  },
  {
    displayName: "English phrase",
    key: "englishPhrase",
  },
  {
    key: "inEnglish",
    space: 0.5,
  },
  {
    key: "nowMimicThePhrase",
  },
  {
    key: "spanishPhrase",
    rate: 0.8,
  },
  {
    key: "asTheAudioLoops3Times",
  },
  {
    key: "spanishPhrase",
    rate: 0.8,
  },
  {
    key: "spanishPhrase",
    rate: 0.8,
  },
  {
    key: "spanishPhrase",
    rate: 0.8,
    space: 1,
  },
  {
    key: "nowPayAttentionForThePhrase",
  },
  {
    key: "spanishPhrase",
  },
  {
    key: "inTheFollowing3Examples",
    space: 1,
  },
  {
    key: "ejemploUno",
  },
  {
    displayName: "Example 1",
    key: "example1",
    space: 1.5,
  },
  {
    key: "ejemploDos",
  },
  {
    displayName: "Example 2",
    key: "example2",
    space: 1.5,
  },
  {
    key: "ejemploTres",
  },
  {
    displayName: "Example 3",
    key: "example3",
    space: 1.5,
  },
  {
    key: "toSay",
  },
  {
    key: "englishPhrase",
  },
  {
    key: "inSpanishYouWouldSay",
  },
  {
    key: "spanishPhrase",
  },
  {
    key: "spanishPhrase",
  },
  {
    key: "spanishPhrase",
    space: 2,
  },
];

const App = () => {
  const [clipName, setClipName] = useState("clip");

  // Refs
  const refs = {
    englishPhrase: useRef<HTMLInputElement>(null),
    spanishPhrase: useRef<HTMLInputElement>(null),
    example1: useRef<HTMLInputElement>(null),
    example2: useRef<HTMLInputElement>(null),
    example3: useRef<HTMLInputElement>(null),
  };

  const processFiles = async () => {
    await Tone.start();

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
        a.download = `${clipName}.${mp4TypeIsSupported ? "m4a" : "webm"}`;
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

        const { rate = 1, space = 0 } = order[index];
        const player = clips[index];
        player.onstop = () => {
          setTimeout(playNext, space * 1000);
        };

        player.playbackRate = rate;
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

    for (const { key } of order) {
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
        const url = `audio/${key}.wav`;
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
      <div className="row">
        <div className="column">Name</div>
        <div className="column">
          <input
            type="text"
            value={clipName}
            onChange={(e) => setClipName(e.target.value)}
          />
        </div>
      </div>
      {order.map((item, index) => {
        const { displayName, key } = item;
        if (displayName === undefined || !(key in refs)) {
          return null;
        }

        return (
          <div key={index} className="row">
            <div className="column">{displayName}</div>
            <div className="column">
              <input ref={refs[key as ClipType]} type="file" />
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
