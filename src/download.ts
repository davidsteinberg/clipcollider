import * as Tone from "tone";

const download = async (p: { recorder: Tone.Recorder; name: string }) => {
  // Create a URL from the recorded data
  const { recorder, name } = p;
  const blob = await recorder.stop();
  const url = URL.createObjectURL(blob);

  // Download the file
  const a = document.createElement("a") as HTMLAnchorElement;
  a.style.display = "none";
  a.download = name;
  a.href = url;
  a.click();
};

export default download;
