import { useRef, useLayoutEffect } from "react";

export default function useKeepScrollXY() {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const el:any = ref.current;
    if (!el) return;

    const save = () => {
      pos.current.x = el.scrollLeft;
      pos.current.y = el.scrollTop;
    };

    el.addEventListener("scroll", save);
    return () => el.removeEventListener("scroll", save);
  }, []);

  useLayoutEffect(() => {
    const el:any = ref.current;
    if (el) {
      el.scrollLeft = pos.current.x;
      el.scrollTop = pos.current.y;
    }
  });

  return ref;
}
