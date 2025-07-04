import { useEffect, useRef, useState, type CSSProperties } from 'react'

type BulmaType = 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'black' | 'white';

const LINK = "https://www.mobzystems.com/online/a-simple-bulma-theme-color-picker/";

/**
 * (Large) helper function (copied from w3schools.com, cleaned up) to convert a hex color to HSL.
 */
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

// Default style map for Bulma types and their default colors (thanks CoPilot for the defaults!)
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
  // The main app theme
  const [mainTheme, setMainTheme] = useState<'light' | 'dark'>('dark');
  // Update the main theme on the documents HTML element
  useEffect(() => document.documentElement.setAttribute('data-theme', mainTheme), [mainTheme]);

  // The default styles
  const [styleMap, setStyleMap] = useState<Map<BulmaType, string>>(defaultStyleMap);

  // Export only customized properties?
  const [customOnly, setCustomOnly] = useState(true);

  // Create a ref to each color picker input
  const colorPickerRefs = new Map(Array.from(defaultStyleMap.keys()).map(type => [type, useRef<HTMLInputElement>(null)]));

  /**
   * Update a single color in the style map
   */
  function updateColor(type: BulmaType, color: string) {
    let newMap = new Map(styleMap);
    newMap.set(type, color);
    setStyleMap(newMap);
  }

  /**
   * Create the actual style sheet CSS to use the theme
   * @returns 
   */
  function createStyleSheet() {
    function exportColor(type: BulmaType, color: string) {
      {
        const hsl = convertRgbToHsl(color);
        const isDefault = defaultStyleMap.get(type) === color;
        if (customOnly && isDefault)
          return '';
        else
          return `
    /* ${type}: ${color} (${isDefault ? 'default' : 'customized'}) */
    --bulma-${type}-h: ${hsl.h};
    --bulma-${type}-s: ${hsl.s};
    --bulma-${type}-l: ${hsl.l};
`;
      }
    }

    return (`@import url(https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css);

/*
 Created with Simple Bulma Theme Color Picker (${LINK}).
 To change: use the JSON below to import your theme there

{ "primary": "${styleMap.get('primary')}", "link": "${styleMap.get('link')}", "info": "${styleMap.get('info')}", "success": "${styleMap.get('success')}", "warning": "${styleMap.get('warning')}", "danger": "${styleMap.get('danger')}",
"light": "${styleMap.get('light')}", "dark": "${styleMap.get('dark')}", "black": "${styleMap.get('black')}","white": "${styleMap.get('white')}" }

*/

/* Bulma overrides */
:root {${Array.from(styleMap).map(([type, color]) => exportColor(type, color)).join('').trimEnd()}
}`);
  }

  // Create a style object with the HSL values for each Bulma type to provide to the Sample component
  let style: React.CSSProperties = {};
  for (const [type, color] of styleMap) {
    const hsl = convertRgbToHsl(color);
    (style as any)[`--bulma-${type}-h`] = hsl.h;
    (style as any)[`--bulma-${type}-s`] = hsl.s;
    (style as any)[`--bulma-${type}-l`] = hsl.l;
  }

  return <>
    {/* Header section */}
    <div className="section">
      <div className="container">
        <h1 className="title">
          Bulma Theme Color Picker
          <button className="button is-pulled-right is-dark" onClick={() => setMainTheme('dark')}>Dark</button>
          <button className="button is-pulled-right is-light" onClick={() => setMainTheme('light')}>Light</button>
        </h1>
        <p className="subtitle">A simple Bulma theme color picker by <a href={LINK} target="_blank">MOBZystems</a></p>
      </div>
    </div>

    {/* The main grid with buttons and colors */}
    <div className="section">
      <div className="container">
        <h2 className="title">Pick your colors</h2>
        <p className="subtitle">Click on any of the buttons to change the <b>main</b> color of its Bulma type.</p>
        <div className="typegrid">
          {/* The Bulma type names */}
          {Array.from(styleMap).map(([type, _color]) => <div key={type}>
            <b>{type}</b>
          </div>)}
          {/* The color pickers */}
          {Array.from(styleMap).map(([type, color]) =>
            <ColorPicker key={type} type={type} color={color} onchange={newColor => updateColor(type, newColor)} ref={colorPickerRefs.get(type) ?? null} />
          )}
          {/* The buttons for each Bulma type */}
          <ButtonGrid styles={styleMap} style={style} refs={colorPickerRefs} />
          {/* Reset buttons for each Bulma type */}
          {Array.from(styleMap).map(([type, color]) => <div key={type}>
            <button className="button is-light is-small" disabled={defaultStyleMap.get(type)! === color} onClick={() => updateColor(type, defaultStyleMap.get(type)!)}>Reset</button>
          </div>)}
        </div>
      </div>
    </div>

    {/* The theme sample */}
    <div className="section" style={style}>
      <Sample />
    </div>

    {/* The CSS text box and import section */}
    <div className="section">
      <div className="container content">
        <h2 className="title">Generated CSS</h2>
        <p className="subtitle">Copy the CSS below to your projects style sheet. <a href={LINK} target="_blank">More information</a></p>
        <textarea className="block textarea is-family-monospace" readOnly rows={10} value={createStyleSheet()} name="css"></textarea>
        <p>
          <label className="checkbox">
            <input type="checkbox" onClick={e => setCustomOnly(e.currentTarget.checked)} checked={customOnly} /> Export customized colors only
          </label>
        </p>

        <Import onImport={setStyleMap} />
      </div>
    </div>
  </>;
}

/**
 * Show a color picker for a specific Bulma type. Set a reference to the input element in the supplied ref object
 */
function ColorPicker(props: { type: BulmaType, color: string, onchange: (color: string) => void, ref: React.Ref<HTMLInputElement | null> }) {
  return <input type="color" ref={props.ref} value={props.color} onChange={(e) => props.onchange(e.target.value)} className="input" />;
}

/**
 * Show a list of buttons for each Bulma type, with a color picker for each.
 */
function ButtonGrid(props: { styles: Map<BulmaType, string>, style: CSSProperties, refs: Map<BulmaType, React.Ref<HTMLInputElement | null>> }) {
  /**
   * Show a single row of buttons for a specific Bulma type.
   */
  function ButtonList(p: { formatValue: (type: BulmaType) => string, extraStyle?: string }) {
    // Cause a click event on the color picker input for a Bulma type
    function clickColorPicker(type: BulmaType) {
      const colorPickerRef: React.Ref<HTMLInputElement | null> | undefined = props.refs.get(type);
      if (colorPickerRef != undefined)
        (colorPickerRef as any).current.click();
    }
    // Show a button for each Bulma type
    return Array.from(props.styles).map(([type, color]) =>
      <button key={type} onClick={() => clickColorPicker(type)} className={`button is-${type}${p.extraStyle ? ` ${p.extraStyle}` : ''}`} title={`${type}: ${color}`}>{p.formatValue(type)}</button>
    );
  }

  // Show a grid with a button list for each Bulma type
  return (
    <div className="buttongrid" style={props.style}>
      <ButtonList formatValue={(type) => `${type}`} />
      <ButtonList formatValue={_type => 'inverted'} extraStyle="is-inverted" />
      <ButtonList formatValue={_type => 'outlined'} extraStyle="is-outlined" />
      <ButtonList formatValue={_type => 'light'} extraStyle="is-light" />
      <ButtonList formatValue={_type => 'dark'} extraStyle="is-dark" />
    </div>
  );
}

function Import(props: {
  onImport: (newMap: Map<BulmaType, string>) => void
}) {

  // State variable to control the import dialog
  const [importing, setImporting] = useState(false);
  // The theme to import (as JSON)
  const [themeToImport, setThemeToImport] = useState('');
  // Was there an impoprt error?
  const [importError, setImportError] = useState('');

  /**
   * Import the theme from the JSON string in `themeToImport`.
   */
  function importTheme(): boolean {

    try {
      const newTheme = JSON.parse(themeToImport);

      if (typeof newTheme !== 'object' || newTheme === null) {
        setImportError('Invalid theme format');
        return false;
      }

      const newMap = new Map<BulmaType, string>(defaultStyleMap);
      for (const type of Object.keys(newTheme) as BulmaType[]) {
        if (!defaultStyleMap.has(type)) {
          setImportError(`Unknown Bulma type: '${type}'`);
          return false;
        }
        if (typeof newTheme[type] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(newTheme[type])) {
          setImportError(`Invalid color for type '${type}': ${newTheme[type]}`);
          return false;
        }
        // No errors: add color to theme map
        newMap.set(type, newTheme[type]);
      }

      props.onImport(newMap);

      setImportError('');

      return true;

    } catch (e) {

      setImportError(`${e}`);
      return false;

    }
  }

  return <>
    {importing ?
      <>
        {/* Importing */}
        {importError !== '' && <p className="has-text-danger">{importError}</p>}
        <textarea className="block textarea is-family-monospace" rows={2} placeholder="Paste your JSON theme here" onChange={e => setThemeToImport(e.target.value)}></textarea>
        <button className="button is-primary" disabled={themeToImport === ''} onClick={() => { if (importTheme()) setImporting(false); }}>Import</button>
        <button className="button is-ghost" onClick={() => { setImporting(false); setImportError(''); }}>Cancel</button>
      </> :
      <>
        {/* Not importing */}
        <button className="button is-primary" onClick={() => { setImporting(true); setThemeToImport(''); }}>Import...</button>
      </>
    }
  </>;
}

/**
 * Show a sample of some controls using the current theme.
 */
function Sample() {
  return (<>
    <div className="block container">
      
      <p className="title">Theme sample</p>
      <p className="subtitle">This is how your theme looks. Try it in light/dark mode.</p>

      <div className="grid4">
        {/* Some notifications */}
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

        {/* Some messages */}
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
            Succes message with a close button
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
    </div>

    <div className="block container content">
      <p>Once you're happy with the theme, copy the generated CSS to your style sheet. <a href="/" onClick={e => e.preventDefault()}>This is a link, by the way</a></p>
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
  </>);
}