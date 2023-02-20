import "./App.css";
import * as Tone from "tone";
import { ChangeEventHandler, useRef, useState } from "react";

const clipNamesByType = {
  englishPhrase: "English phrase",
  spanishPhrase: "Spanish phrase",
  englishLoopInstructions: "English loop instructions",
  englishExampleInstructions: "English example instructions",
  example1: "Example 1",
  example2: "Example 2",
  example3: "Example 3",
} as const;

type ClipType = keyof typeof clipNamesByType;

const App = () => {
  const [loopCount, setLoopCount] = useState(3);
  const refs: Record<ClipType, React.RefObject<HTMLInputElement>> = {
    englishPhrase: useRef<HTMLInputElement>(null),
    spanishPhrase: useRef<HTMLInputElement>(null),
    englishLoopInstructions: useRef<HTMLInputElement>(null),
    englishExampleInstructions: useRef<HTMLInputElement>(null),
    example1: useRef<HTMLInputElement>(null),
    example2: useRef<HTMLInputElement>(null),
    example3: useRef<HTMLInputElement>(null),
  };

  const onLoopCountChange: ChangeEventHandler = (event) => {
    const input = event.target as HTMLInputElement;
    setLoopCount(Number(input.value));
  };

  const processFiles = () => {
    Tone.start();

    const loopOrder = Array.from({ length: loopCount }).map(
      () => "spanishPhrase" as ClipType
    );

    const order: ClipType[] = [
      // 1. English phrase
      "englishPhrase",
      "spanishPhrase",
      "englishLoopInstructions",
      ...loopOrder,
      "englishExampleInstructions",
      "example1",
      "example2",
      "example3",
      "englishPhrase",
      ...loopOrder,
    ];

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
        player.onstop = playNext;
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

    for (const type of order) {
      const files = refs[type].current!.files;
      if (files === null || files.length === 0) {
        alert(`Missing ${clipNamesByType[type]}`);
        return;
      }

      const file = files[0];
      const url = URL.createObjectURL(file);
      const player = new Tone.Player(url, onload);
      player.connect(output);

      clips.push(player);
    }

    // const reader = new FileReader();
    // reader.onload = function(e) {
    //   console.log(e.target.result);
    //   playSound(e.target.result);
    // };
    // reader.readAsArrayBuffer(file);
  };

  return (
    <div className="App">
      <h2>The Clip Collider</h2>
      {Object.entries(clipNamesByType).map(([type, name], key) => {
        return (
          <div key={key} className="row">
            <div className="type">
              {name}
              {type === "spanishPhrase" ? (
                <>
                  <input
                    className="loop-count"
                    type="number"
                    min={1}
                    value={loopCount}
                    onChange={onLoopCountChange}
                  />
                  times
                </>
              ) : null}
            </div>
            <div className="file">
              <input ref={refs[type as ClipType]} type="file" />
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
