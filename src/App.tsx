import { Fragment, useEffect, useState } from 'react'

type BulmaType = 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'black' | 'white';
// const bulmaTypes: string[] = ['primary', 'link', 'info', 'success', 'warning', 'danger'];

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

const defaultStyleMap = new Map<BulmaType, string>([
    ['primary', '#00d1b2'],
    ['link', '#3273dc'],
    ['info', '#209cee'],
    ['success', '#23d160'],
    ['warning', '#ffdd57'],
    ['danger', '#ff3860'],
    ['light', '#f5f5f5'],
    ['dark', '#363636'],
    ['black', '#000000'],
    ['white', '#ffffff']
]);

export default function App() {
  const [mainTheme, setMainTheme] = useState<'light' | 'dark'>('dark');
  const [styleMap, setStyleMap] = useState<Map<BulmaType, string>>(defaultStyleMap);

  function updateColor(type: BulmaType, color: string) {
    let newMap = new Map(styleMap);
    newMap.set(type, color);
    setStyleMap(newMap);
  }

  useEffect(() => document.documentElement.setAttribute('data-theme', mainTheme), [mainTheme]);

  return <>
    <div className="section is-smnall is-info" data-theme={mainTheme}>
      <div className="block container">
        <h1 className="title">
          Hello there
          <button className="button is-pulled-right is-dark" onClick={() => setMainTheme('dark')}>Dark</button>
          <button className="button is-pulled-right is-light" onClick={() => setMainTheme('light')}>Light</button>
        </h1>
        <p className="subtitle">This is a simple Bulma theme color picker.</p>
      </div>
      <div className="block container typegrid">
        {Array.from(styleMap).map(([type, _color]) => <div key={type}>
          is-{type}
        </div>)}
        {Array.from(styleMap).map(([type, color]) =>
          <ColorPicker key={type} type={type} color={color} onchange={newColor => updateColor(type, newColor)} />
        )}
        <Sample styles={styleMap} />
        {Array.from(styleMap).map(([type, color]) => <div key={type}>
          <button className="button is-light is-small" disabled={defaultStyleMap.get(type)! === color} onClick={() => updateColor(type, defaultStyleMap.get(type)!)}>Reset</button>
        </div>)}
      </div>
    </div>
  </>;
}

function ColorPicker(props: { type: BulmaType, color: string, onchange: (color: string) => void }) {
  return <input type="color" value={props.color} onChange={(e) => props.onchange(e.target.value)} className="input" />;
}

function Sample(props: { styles: Map<BulmaType, string>}) {
  let style: React.CSSProperties = {};
  for (const [type, color] of props.styles) {
    addStyle(style, type, color);
  }

  return (
    <div className="sample" style={style}>
      {Array.from(props.styles).map(([type, color]) =>
        <button key={type} className={`button is-${type}`} title={`${type}: ${color}`}>is-{type}</button>
      )}
      {Array.from(props.styles).map(([type, color]) => <div key={type}>
        <button key={`${type}-inverted`} className={`button is-${type} is-inverted`} title={`${type}: ${color}`}>is-inverted</button>
      </div>)}
      {Array.from(props.styles).map(([type, color]) => <div key={type}>
        <button key={`${type}-outlined`} className={`button is-${type} is-outlined`} title={`${type}: ${color}`}>is-outlined</button>
      </div>)}
    </div>
  );
}