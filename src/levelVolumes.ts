import * as Tone from "tone";
import order from "./order";

// Note: Ideally this would take clips as input
// and output new clips with adjusted volumes
// but it is currently a side effect of the function

const levelVolumes = async (p: {
  output: Tone.Volume;
  clips: Tone.Player[];
}): Promise<void> => {
  const { output, clips } = p;

  // Set up promise to resolve later on
  let resolve: () => void = () => {};
  const promise = new Promise<void>((_resolve) => (resolve = _resolve));

  // Set up meter to measure levels
  const meter = new Tone.Meter();
  Tone.Destination.connect(meter);

  const averageVolumesByClip: Record<string, number> = {};
  const sum = (previous: number, current: number) => previous + current;

  // Average volumes and adjust each accordingly
  const applyVolumes = () => {
    const averageVolumes = Object.values(averageVolumesByClip);
    const overallAverageVolume =
      averageVolumes.reduce(sum, 0) / averageVolumes.length;

    for (const [indexString, { key }] of Object.entries(order)) {
      const player = clips[Number(indexString)];
      const averageVolume = averageVolumesByClip[key];
      const volumeDelta = overallAverageVolume - averageVolume;

      console.log("Apply", { key, averageVolume, volumeDelta });

      const volume = new Tone.Volume(volumeDelta);

      player.connect(volume);
      volume.connect(output);
    }

    resolve();
  };

  let index = -1;
  const checkNext = () => {
    index++;

    // Check clips while there are still some to try
    if (index < clips.length) {
      const { key } = order[index];

      // Skip already checked volumes
      if (key in averageVolumesByClip) {
        checkNext();
      } else {
        // Check clip volume
        console.log(`Check volume for ${key}, index: ${index}`);

        const player = clips[index];
        const volumes: number[] = [];

        player.connect(output);

        // Check volume 10 times a second
        const interval = setInterval(() => {
          // This is a safe cast (as opposed to number[])
          // because we have a single channel
          const volume = meter.getValue() as number;
          if (volume > -Infinity && volume < Infinity) {
            // Track legitimate volumes
            volumes.push(volume);
          } else {
            console.log(`Received ${volume} volume`);
          }
        }, 100);

        // Check and set the average volume after playing through
        // then move on to the next clip
        player.onstop = () => {
          clearInterval(interval);
          const averageVolume = volumes.reduce(sum, 0) / volumes.length;
          console.log(`Average volume: ${averageVolume}`);
          averageVolumesByClip[key] = averageVolume;
          player.disconnect(output);
          checkNext();
        };

        player.start();
      }
    } else {
      // Stop monitoring levels and adjust volumes
      Tone.Destination.disconnect(meter);
      applyVolumes();
    }
  };

  checkNext();

  return promise;
};

export default levelVolumes;
