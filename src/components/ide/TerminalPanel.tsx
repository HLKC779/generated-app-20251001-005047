import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useTheme } from '@/hooks/use-theme';
const theme = {
  light: {
    background: '#ffffff',
    foreground: '#000000',
    cursor: '#000000',
  },
  dark: {
    background: '#000000',
    foreground: '#ffffff',
    cursor: '#ffffff',
  },
};
export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      fontSize: 14,
      theme: isDark ? theme.dark : theme.light,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    term.writeln('Welcome to VibeCode Terminal!');
    term.writeln('$ This is a simulated terminal for demonstration purposes.');
    term.write('$ ');
    const resizeObserver = new ResizeObserver(() => {
      // Defer the fit call to the next animation frame to avoid the loop warning
      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch (e) {
          console.warn("Terminal fit failed:", e);
        }
      });
    });
    resizeObserver.observe(terminalRef.current);
    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [isDark]);
  return <div ref={terminalRef} className="h-full w-full p-2" />;
}