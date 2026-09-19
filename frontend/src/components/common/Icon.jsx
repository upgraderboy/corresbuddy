import React from 'react';

export function Icon({ name, className = '', style = {} }) {
  const p = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const map = {
    home: (
      <>
        <path {...p} d="M4 11.5 12 4l8 7.5" />
        <path {...p} d="M6 10v9h12v-9" />
        <path {...p} d="M10 19v-5h4v5" />
      </>
    ),
    users: (
      <>
        <circle {...p} cx="8.5" cy="8" r="3.2" />
        <path {...p} d="M2.5 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
        <circle {...p} cx="17" cy="9" r="2.6" />
        <path {...p} d="M15.2 13.7c2.6.4 4.3 2.3 4.3 5.3" />
      </>
    ),
    book: (
      <>
        <path {...p} d="M4 5.2C6 4.3 9 4.3 12 5.6c3-1.3 6-1.3 8 -.4v13.6c-2-.9-5-.9-8 .4-3-1.3-6-1.3-8-.4Z" />
        <path {...p} d="M12 5.6v13.6" />
      </>
    ),
    help: (
      <>
        <circle {...p} cx="12" cy="12" r="9" />
        <path {...p} d="M9.5 9.3a2.5 2.5 0 1 1 3.6 2.2c-.9.5-1.4 1-1.4 2.1" />
        <circle cx="12" cy="16.7" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    message: (
      <>
        <path {...p} d="M3.5 5.5h17v11h-9L7 20v-3.5H3.5Z" />
      </>
    ),
    layers: (
      <>
        <path {...p} d="m12 3 9 4.5-9 4.5-9-4.5Z" />
        <path {...p} d="m3 12 9 4.5 9-4.5" />
        <path {...p} d="m3 16.5 9 4.5 9-4.5" />
      </>
    ),
    bookmark: <path {...p} d="M6 3.5h12v17l-6-4-6 4Z" />,
    bell: (
      <>
        <path {...p} d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
        <path {...p} d="M10 19a2 2 0 0 0 4 0" />
      </>
    ),
    user: (
      <>
        <circle {...p} cx="12" cy="8" r="3.6" />
        <path {...p} d="M4.5 20c0-4.1 3.3-6.6 7.5-6.6s7.5 2.5 7.5 6.6" />
      </>
    ),
    shield: <path {...p} d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6Z" />,
    upload: (
      <>
        <path {...p} d="M12 15V4" />
        <path {...p} d="m7.5 8.5 4.5-4.5 4.5 4.5" />
        <path {...p} d="M4.5 15v4.5h15V15" />
      </>
    ),
    download: (
      <>
        <path {...p} d="M12 4v11" />
        <path {...p} d="m7.5 11 4.5 4.5 4.5-4.5" />
        <path {...p} d="M4.5 19.5h15" />
      </>
    ),
    search: (
      <>
        <circle {...p} cx="10.5" cy="10.5" r="6.5" />
        <path {...p} d="m19.5 19.5-4.4-4.4" />
      </>
    ),
    filter: <path {...p} d="M4 5h16l-6 7v6l-4 2v-8Z" />,
    check: (
      <>
        <circle {...p} cx="12" cy="12" r="9" />
        <path {...p} d="m8 12.3 2.6 2.6L16.3 9" />
      </>
    ),
    flame: (
      <path
        {...p}
        d="M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0c0-1.3.5-2.2 1.2-3.2.2 1 .9 1.5 1.6 1.3-.4-2 .3-4 2.2-7.6Z"
      />
    ),
    plus: <path {...p} d="M12 4.5v15M4.5 12h15" />,
    send: <path {...p} d="m4 12 16-8-6 16-2.5-6.5Z" />,
    chevronRight: <path {...p} d="m9 6 6 6-6 6" />,
    chevronDown: <path {...p} d="m6 9 6 6 6-6" />,
    x: <path {...p} d="M6 6l12 12M18 6 6 18" />,
    menu: <path {...p} d="M4 7h16M4 12h16M4 17h16" />,
    star: <path {...p} d="m12 3.5 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7Z" />,
    branch: (
      <>
        <circle {...p} cx="6" cy="6" r="2.3" />
        <circle {...p} cx="6" cy="18" r="2.3" />
        <circle {...p} cx="18" cy="9" r="2.3" />
        <path {...p} d="M6 8.3V15.7" />
        <path {...p} d="M6 15.7C6 11 10 11 18 11.3" />
      </>
    ),
    settings: (
      <>
        <circle {...p} cx="12" cy="12" r="3.2" />
        <path
          {...p}
          d="M19 12a7 7 0 0 0-.15-1.4l1.9-1.5-2-3.4-2.3.8a7 7 0 0 0-2.4-1.4L13.5 3h-3l-.55 2.1a7 7 0 0 0-2.4 1.4l-2.3-.8-2 3.4L5.15 10.6A7 7 0 0 0 5 12c0 .5.05 1 .15 1.4l-1.9 1.5 2 3.4 2.3-.8a7 7 0 0 0 2.4 1.4L10.5 21h3l.55-2.1a7 7 0 0 0 2.4-1.4l2.3.8 2-3.4-1.9-1.5c.1-.4.15-.9.15-1.4Z"
        />
      </>
    ),
    logout: (
      <>
        <path {...p} d="M9 4.5H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H9" />
        <path {...p} d="M14.5 16.5 19 12l-4.5-4.5" />
        <path {...p} d="M19 12H9" />
      </>
    ),
    clock: (
      <>
        <circle {...p} cx="12" cy="12" r="9" />
        <path {...p} d="M12 7v5l3.3 2" />
      </>
    ),
    dot: <circle cx="12" cy="12" r="4" fill="currentColor" />,
    check2: <path {...p} d="m5 13 4 4L19 7" />,
  };

  return (
    <svg className={`icon ${className}`} style={style} viewBox="0 0 24 24">
      {map[name] || null}
    </svg>
  );
}

export default Icon;

