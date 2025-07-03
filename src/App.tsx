import { useEffect, useState, type CSSProperties } from 'react'

type BulmaType = "primary" | "link" | "info" | "success" | "warning" | "danger";

function convertRgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
  var rgb = [r / 255, g / 255, b / 255];

  var min = rgb[0], max = rgb[0], maxcolor = 0;
  for (let i = 0; i < rgb.length - 1; i++) {
    if (rgb[i + 1] <= min) { min = rgb[i + 1]; }
    if (rgb[i + 1] >= max) { max = rgb[i + 1]; maxcolor = i + 1; }
  }

  let h = 0;
  if (maxcolor == 0)
    h = (rgb[1] - rgb[2]) / (max - min);
  else if (maxcolor == 1)
    h = 2 + (rgb[2] - rgb[0]) / (max - min);
  else if (maxcolor == 2)
    h = 4 + (rgb[0] - rgb[1]) / (max - min);

  if (isNaN(h))
    h = 0;
  h = h * 60;

  if (h < 0)
    h = h + 360;

  let l = (min + max) / 2;

  let s;
  if (min == max)
    s = 0;
  else if (l < 0.5)
    s = (max - min) / (max + min);
  else
    s = (max - min) / (2 - max - min);

  // s = s;
  return { h: Math.round(h), s: Math.round(s * 1000) / 10, l: Math.round(l * 1000) / 10 };

  // return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function addStyle(style: any, type: BulmaType, color: string): any {
  const hsl = convertRgbToHsl(
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16)
  );
  style[`--bulma-${type}-h`] = hsl.h.toString();
  style[`--bulma-${type}-s`] = hsl.s.toString() + '%';
  style[`--bulma-${type}-l`] = hsl.l.toString() + '%';
}

export default function App() {
  const [primaryColor, setPrimaryColor] = useState('#00d1b2');
  const [linkColor, setLinkColor] = useState('#3273dc');
  const [infoColor, setInfoColor] = useState('#209cee');
  const [successColor, setSuccessColor] = useState('#23d160');
  const [warningColor, setWarningColor] = useState('#ffdd57');
  const [dangerColor, setDangerColor] = useState('#ff3860');

  let style: React.CSSProperties = {};
  addStyle(style, 'primary', primaryColor);
  addStyle(style, 'link', linkColor);

  return <>
    <div className="section is-smnall is-info">
      <div className="block container">
        <h1 className="title">Hello there</h1>
        <p className="subtitle">This is a simple Bulma theme color picker.</p>
      </div>
      <div className="block container">
        <ColorPicker type="primary" color={primaryColor} onchange={setPrimaryColor} />
        <ColorPicker type="link" color={linkColor} onchange={setLinkColor} />
        <ColorPicker type="info" color={infoColor} onchange={setInfoColor} />
        <ColorPicker type="success" color={successColor} onchange={setSuccessColor} />
        <ColorPicker type="warning" color={warningColor} onchange={setWarningColor} />
        <ColorPicker type="danger" color={dangerColor} onchange={setDangerColor} />
      </div>
      <Sample style={style} />
    </div>
  </>;
}

function ColorPicker(props: { type: BulmaType, color: string, onchange: (color: string) => void }) {

  const [color, setColor] = useState(props.color);

  const hsl = convertRgbToHsl(
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16)
  );

  return (
    <div className="field">
      <label className="label"><b>{props.type}</b></label>
      <div className="control">
        <input type="color" value={color} onChange={(e) => { setColor(e.target.value); props.onchange(e.target.value); }} className="input" />
      </div>
      <p className="help">Current color: {color} ({hsl.h}, {hsl.s}, {hsl.l})</p>
    </div>
  );
}

function Sample(props: { style: React.CSSProperties }) {
  return (
    <div className="block container" style={props.style}>
      <div className="notification is-primary">Primary</div>
      <div className="notification is-link">Link</div>
      <div className="notification is-info">Info</div>
      <div className="notification is-success">Success</div>
      <div className="notification is-warning">Warning</div>
      <div className="notification is-danger">Danger</div>
    </div>
  );
}