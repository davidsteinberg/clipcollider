import * as Tone from "tone";
import levelVolumes from "./levelVolumes";
import order from "./order";
import record from "./record";

const processFiles = async (p: {
  autoLevel: boolean;
  name: string;
  urls: Record<string, string>;
}) => {
  const { autoLevel, name, urls } = p;

  // Make sure Tone.js is ready to go
  await Tone.start();

  const clips: Tone.Player[] = [];
  const output = new Tone.Volume(0).toDestination();

  // NOTE: MAGIC NUMBER
  // The first number comes from the number of files in public/audio
  let count = 12 + Object.values(urls).length;

  // After all players have been loaded,
  // level volumes and record
  const onload = async () => {
    count -= 1;
    if (count === 0) {
      const p = {
        output,
        name,
        clips,
      };

      if (autoLevel) {
        await levelVolumes(p);
      }

      record(p);
    }
  };

  // Load a player for each item in order
  for (const { key } of order) {
    const url = key in urls ? urls[key] : `audio/${key}.wav`;
    const player = new Tone.Player({
      url,
      onload,
      onerror(error) {
        alert(`Something went wrong for file ${url}! ${error}`);
      },
    });

    player.connect(output);
    clips.push(player);
  }
};

export default processFiles;
