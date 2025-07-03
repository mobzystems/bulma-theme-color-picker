import { useEffect, useState, type CSSProperties } from 'react'

type BulmaType = 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'black' | 'white'; //  | 'text' | 'ghost';

function convertRgbToHsl(color: string): { h: string, s: string, l: string } {
  var rgb = [parseInt(color.slice(1, 3), 16) / 255, parseInt(color.slice(3, 5), 16) / 255, parseInt(color.slice(5, 7), 16) / 255];

  var min = rgb[0], max = rgb[0], maxcolor = 0;
  for (let i = 0; i < rgb.length - 1; i++) {
    if (rgb[i + 1] <= min) { min = rgb[i + 1]; }
    if (rgb[i + 1] >= max) { max = rgb[i + 1]; maxcolor = i + 1; }
  }

  let h = 0;
  if (maxcolor === 0)
    h = (rgb[1] - rgb[2]) / (max - min);
  else if (maxcolor === 1)
    h = 2 + (rgb[2] - rgb[0]) / (max - min);
  else if (maxcolor === 2)
    h = 4 + (rgb[0] - rgb[1]) / (max - min);

  if (isNaN(h))
    h = 0;
  h = h * 60;

  if (h < 0)
    h = h + 360;

  let l = (min + max) / 2;

  let s;
  if (min === max)
    s = 0;
  else if (l < 0.5)
    s = (max - min) / (max + min);
  else
    s = (max - min) / (2 - max - min);

  return { h: `${Math.round(h)}deg`, s: `${Math.round(s * 1000) / 10}%`, l: `${Math.round(l * 1000) / 10}%` };
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
  ['white', '#ffffff'],
  // ['text', '#4a4a4a'],
  // ['ghost', '#f5f5f5']
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

  function createStyleSheet() {
    return (`@import url(https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css);

/* Bulma overrides */
:root {${Array.from(styleMap).map(([type, color]) => {
      const hsl = convertRgbToHsl(color);
      return `
  /* ${type}: ${color} (${color === defaultStyleMap.get(type)! ? 'default' : 'customized'}) */
  --bulma-${type}-h: ${hsl.h};
  --bulma-${type}-s: ${hsl.s};
  --bulma-${type}-l: ${hsl.l};
`;
    }).join('').trimEnd()}
}`);
  }

  let style: React.CSSProperties = {};
  for (const [type, color] of styleMap) {
    const hsl = convertRgbToHsl(color);
    (style as any)[`--bulma-${type}-h`] = hsl.h;
    (style as any)[`--bulma-${type}-s`] = hsl.s;
    (style as any)[`--bulma-${type}-l`] = hsl.l;
  }

  return <>
    <div className="section">
      <div className="container">
        <h1 className="title">
          Bulma Theme Color Picker
          <button className="button is-pulled-right is-dark" onClick={() => setMainTheme('dark')}>Dark</button>
          <button className="button is-pulled-right is-light" onClick={() => setMainTheme('light')}>Light</button>
        </h1>
        <p className="subtitle">A simple Bulma theme color picker by <a href="https://www.mobzystems.com" target="_blank">MOBZystems</a></p>
      </div>
    </div>
    <div className="section">
      <div className="container typegrid">
        {Array.from(styleMap).map(([type, _color]) => <div key={type}>
          <b>{type}</b>
        </div>)}
        {Array.from(styleMap).map(([type, color]) =>
          <ColorPicker key={type} type={type} color={color} onchange={newColor => updateColor(type, newColor)} />
        )}
        <ButtonGrid styles={styleMap} style={style} />
        {Array.from(styleMap).map(([type, color]) => <div key={type}>
          <button className="button is-light is-small" disabled={defaultStyleMap.get(type)! === color} onClick={() => updateColor(type, defaultStyleMap.get(type)!)}>Reset</button>
        </div>)}
      </div>
    </div>
    <div className="section">
      <div className="container">
        <h2 className="title is-4">Generated CSS</h2>
        <p className="subtitle is-6">Copy the CSS below to your project's style sheet</p>
        <textarea className="textarea is-family-monospaced" readOnly rows={10} value={createStyleSheet()}></textarea>
      </div>
    </div>
    <Sample style={style} />
  </>;
}

function ColorPicker(props: { type: BulmaType, color: string, onchange: (color: string) => void }) {
  return <input type="color" value={props.color} onChange={(e) => props.onchange(e.target.value)} className="input" />;
}

function ButtonGrid(props: { styles: Map<BulmaType, string>, style: CSSProperties }) {
  function ButtonList(p: { formatValue: (type: BulmaType) => string, extraStyle?: string }) {
    return Array.from(props.styles).map(([type, color]) =>
      <button key={type} className={`button is-${type}${p.extraStyle ? ` ${p.extraStyle}` : ''}`} title={`${type}: ${color}`}>{p.formatValue(type)}</button>
    );
  }
  return (
    <div className="buttongrid" style={props.style}>
      <ButtonList formatValue={(type) => `${type}`} />
      <ButtonList formatValue={_type => 'inverted'} extraStyle="is-inverted" />
      <ButtonList formatValue={_type => 'outlined'} extraStyle="is-outlined" />
      <ButtonList formatValue={_type => 'light'} extraStyle="is-light" />
      <ButtonList formatValue={_type => 'dark'} extraStyle="is-dark" />
      {/* <ButtonList formatValue={_type => 'is-text'} extraStyle="is-text" /> */}
      {/* <ButtonList formatValue={_type => 'is-ghost'} extraStyle="is-ghost" /> */}
    </div>
  );
}

function Sample(props: { style: CSSProperties }) {
  return (
    <div className="sample section" style={props.style}>
      <div className="block container">
        <p className="title">Title</p>
        <p className="subtitle">Subtitle</p>
        <div className="notification is-info">
          <button className="delete"></button>
          <p>Notification: This is a message</p>
        </div>
        <div className="notification is-success">
          <button className="delete"></button>
          <p>Notification: Operation completed successfully</p>
        </div>
        <div className="notification is-warning">
          <button className="delete"></button>
          <p>Notification: Operation completed with warnings</p>
        </div>
        <div className="notification is-danger">
          <button className="delete"></button>
          <p>Error notification</p>
        </div>

        <article className="message is-info">
          <div className="message-body">
            Information message
          </div>
        </article>
        <article className="message is-success">
          <div className="message-header">
            <p>Success</p>
            <button className="delete" aria-label="delete"></button>
          </div>
          <div className="message-body">
            Succes message
          </div>
        </article>
        <article className="message is-warning">
          <div className="message-body">
            Warning message
          </div>
        </article>
        <article className="message is-danger">
          <div className="message-body">
            Error message
          </div>
        </article>
      </div>

      <div className="block container content">
        <p>This is how your custom theme looks. <a href="/" onClick={e => e.preventDefault()}>This is a link</a></p>
        <div className="buttons">
          <button className="button is-primary">OK</button>
          <button className="button is-link">More...</button>
          <button className="button is-info">See also</button>
          <button className="button is-success">Success</button>
          <button className="button is-warning">Warning</button>
          <button className="button is-danger">Danger</button>
          <button className="button is-text">Text</button>
          <button className="button is-ghost">Ghost</button>
          <button className="button is-static">Static</button>
        </div>
      </div>
    </div>
  );
}