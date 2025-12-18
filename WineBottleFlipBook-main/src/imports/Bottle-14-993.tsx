import svgPaths from "./svg-c8i0fvazog";

function Group() {
  return (
    <div className="relative size-full" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1690 420">
        <g id="Group">
          <path d={svgPaths.p3f7e7380} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function Bottle() {
  return (
    <div className="relative size-full" data-name="Bottle">
      <div className="absolute flex inset-[25.26%_0.01%_25.55%_0.99%] items-center justify-center">
        <div className="flex-none h-[419.819px] scale-y-[-100%] w-[1689.56px]">
          <Group />
        </div>
      </div>
    </div>
  );
}