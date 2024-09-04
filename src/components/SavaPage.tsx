import { useRef, createRef, RefObject, useEffect } from "react";
import { AtSign, Github, Mail } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { init, tx, id } from "@instantdb/react";
import { useToast } from "../hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import savaLogo from '../assets/sava_logo.png'
import solanaLogo from '../assets/solanaLogo.svg'

const APP_ID = "701187a3-5f38-4b49-90a6-3dbc5db78489";
const MAX_VOTES = 3;

type Schema = {
  counters: {
    id: string;
    csharpCounter: number;
    goCounter: number;
    phpCounter: number;
  };
  "topics-example": {
    icon: {
      language: string;
      rotationAngle: number;
      directionAngle: number;
    };
  };
};

const db = init<Schema>({ appId: APP_ID });

const { usePublishTopic, useTopicEffect } = db.room();

// Function to initialize the counters if not present
const initializeCounters = () => {
  db.transact([
    tx.counters[id()].update({
      csharpCounter: 0,
      goCounter: 0,
      phpCounter: 0,
    }),
  ]);
};

function style(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles);
}

function animateSvg(
  config: { rotationAngle: number; directionAngle: number },
  target: HTMLDivElement | null
) {
  if (!target) return;

  const rootEl = document.createElement("div");
  const directionEl = document.createElement("div");
  const spinEl = document.createElement("div");

  // Copy the SVG content
  spinEl.innerHTML = target.innerHTML;
  directionEl.appendChild(spinEl);
  rootEl.appendChild(directionEl);
  document.body.appendChild(rootEl); // Append to the body to animate globally

  // Get the position of the target button
  const targetRect = target.getBoundingClientRect();

  // Set initial styles for the root element (at the button position)
  style(rootEl, {
    position: "fixed",
    top: `${targetRect.top}px`,
    left: `${targetRect.left}px`,
    width: `${targetRect.width}px`,
    height: `${targetRect.height}px`,
    zIndex: "9999",
    pointerEvents: "none",
  });

  // Set initial spin animation styles
  style(spinEl, {
    transform: `rotateZ(${config.rotationAngle * 400}deg)`,
    width: "100%",
    height: "100%",
  });

  // After a short delay, animate the SVG flying away
  setTimeout(() => {
    style(directionEl, {
      transform: `translate(${Math.random() * 100 - 50}vw, ${
        Math.random() * 100 - 50
      }vh) scale(2)`,
      transition: "transform 1s ease-out, opacity 1s ease-out",
      opacity: "0",
    });
  }, 20);

  // Remove the element after the animation is complete
  setTimeout(() => rootEl.remove(), 1000);
}

const Hero12 = () => {
  const { toast } = useToast();

  const publishIconAnimation = usePublishTopic("icon");

  const svgRefsInit = {
    csharpCounter: createRef<HTMLDivElement>(),
    goCounter: createRef<HTMLDivElement>(),
    phpCounter: createRef<HTMLDivElement>(),
  };

  const svgRefsRef = useRef<{
    [key: string]: RefObject<HTMLDivElement>;
  }>(svgRefsInit);

  // Listen to icon topic and animate the icons
  useTopicEffect("icon", ({ language, rotationAngle, directionAngle }) => {
    animateSvg(
      { rotationAngle, directionAngle },
      svgRefsRef.current[language]?.current
    );
  });

  // Read Data
  const { data, isLoading, error } = db.useQuery({
    counters: {},
  });

  useEffect(() => {
    if (
      !isLoading &&
      !error &&
      data &&
      (!data.counters || data.counters.length === 0)
    ) {
      initializeCounters();
    }
  }, [isLoading, error, data]);

  const counters = data?.counters?.[0] ?? {
    csharpCounter: 0,
    goCounter: 0,
    phpCounter: 0,
  };

  // Increment and publish animation to the topic
  const incrementCounter = (
    counterName: "csharpCounter" | "goCounter" | "phpCounter",
    language: string
  ) => {
    const currentVoteCount = parseInt(
      localStorage.getItem("voteCount") || "0",
      10
    );

    if (currentVoteCount >= MAX_VOTES) {
      toast({
        title: "AllocError",
        description: "ArrayList.add() failed: OutOfVotesError",
        variant: "destructive",
      });
      return;
    }

    // Check if `counters` has the `id` property
    if ("id" in counters) {
      // Safe to access counters.id now
      db.transact([
        tx.counters[counters.id].update({
          [counterName]: counters[counterName] + 1,
        }),
      ]);
    } else {
      // Handle the case where counters does not have an `id`
      console.error("Counters object does not have an 'id' property");
    }

    localStorage.setItem("voteCount", (currentVoteCount + 1).toString());

    const randomRotation = Math.random() * 360;
    const randomDirection = Math.random() * 360;

    animateSvg(
      { rotationAngle: randomRotation, directionAngle: randomDirection },
      svgRefsRef.current[counterName]?.current
    );
    // Publish the animation to the topic
    publishIconAnimation({
      language,
      rotationAngle: randomRotation,
      directionAngle: randomDirection,
    } as never);
  };

  /*const resetVotes = () => {
        localStorage.removeItem('voteCount');
        alert("Vote count has been reset.");
      };*/

  return (
    <section className="relative overflow-hidden py-32">
      <div className="container">
        <div className="absolute inset-x-0 top-0 z-10 flex size-full items-center justify-center opacity-100"></div>
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="z-10 flex flex-col items-center gap-6 text-center">
            <img
              src={savaLogo}
              alt="logo"
              className="h-64"
            />
            <img
              src={solanaLogo}
              alt="logo"
              className="h-6 opacity-90"
            ></img>
            <div>
              <h1 className="mb-6 text-pretty text-1xl font-bold lg:text-5xl">
                Build your next project with Sava
              </h1>
              <p className="text-muted-foreground lg:text-lg">
                Sava is a Java SDK for building backend services that seamlessly
                interact with Solana.
              </p>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <a href="https://github.com/sava-software/sava" target="_blank">
                <Button>
                  <Github className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </a>
              <a href="mailto:hello@sava.software">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </a>
              <a href="https://x.com/sava_software" target="_blank">
                <Button variant="outline">
                  <AtSign className="mr-2 h-4 w-4" />
                  Follow
                </Button>
              </a>
              {/*<Button onClick={resetVotes} variant="outline">Reset Votes</Button>*/}
            </div>
            
            {/*<div className="mt-20 flex flex-col items-center gap-4">*/}
            {/*  <p className="text-center: text-muted-foreground lg:text-left">*/}
            {/*    What language would you like to see next?*/}
            {/*  </p>*/}
            {/*  <div className="flex flex-wrap items-center justify-center gap-4">*/}
            {/*    /!* C# Counter *!/*/}
            {/*    <div className="flex flex-col items-center justify-center">*/}
            {/*      <div ref={svgRefsRef.current.csharpCounter}>*/}
            {/*        <a*/}
            {/*          href="#"*/}
            {/*          onClick={() =>*/}
            {/*            incrementCounter("csharpCounter", "csharpCounter")*/}
            {/*          }*/}
            {/*          className={cn(*/}
            {/*            buttonVariants({ variant: "outline" }),*/}
            {/*            "group px-3 h-20 w-20 opacity-50 hover:fill-[#68217A] hover:opacity-100 transition-all"*/}
            {/*          )}*/}
            {/*        >*/}
            {/*          <svg width="128" viewBox="0 0 128 128" className="">*/}
            {/*            <path d="M109 50h-4.8l-1.2 6h-3.8l1.2-6h-4.9l-1.2 6H89v5h4.4l-.9 4H89v5h2.5l-1.2 6h4.8l1.2-6h3.8l-1.2 6h4.9l1.2-6h5v-5h-4.1l.9-4h3.2v-5h-2.2l1.2-6zm-7.9 15h-3.8l.9-4h3.8l-.9 4zm15.4-32.7c-.6-1.1-1.4-2.1-2.3-2.6L66.1 1.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7L11.4 29.7c-1.7 1-3.4 3.5-3.4 5.4v55.7c0 1.1.7 2.3 1.4 3.4l.1.1c.5.8 1.3 1.5 2 1.9l48.3 27.9c.8.5 2 .7 3.2.7 1.2 0 2.3-.3 3.1-.7l47.5-27.9c1.7-1 2.4-3.5 2.4-5.4V35.1c0-.8.4-1.8 0-2.6l.5-.2zm-4.2 2.1c0 .3-.3.5-.3.7v55.7c0 .8-.2 1.7-.4 2L64 120.6c-.1.1-.5.2-1.1.2-.6 0-1-.1-1.1-.2L13.6 92.8s-.1-.1-.2-.1l-.6-.6c-.4-.7.2-1.1-.8-1.2V35.2c1-.5.9-1.7 1.4-1.9L61.7 5.4c.1 0 .6-.2 1.2-.2s1 .1 1.1.2l48 27.7.4.9c.1.1-.1.3-.1.4zM63 87.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6C80.1 82.5 72.1 87.5 63 87.5z"></path>*/}
            {/*          </svg>*/}
            {/*        </a>*/}
            {/*      </div>*/}
            {/*      <code className="max-w-16 mt-2 truncate select-none">*/}
            {/*        {isLoading ? "..." : counters.csharpCounter || 0}*/}
            {/*      </code>*/}
            {/*    </div>*/}

            {/*    /!* Go Counter *!/*/}
            {/*    <div className="flex flex-col items-center justify-center">*/}
            {/*      <div ref={svgRefsRef.current.goCounter}>*/}
            {/*        <a*/}
            {/*          href="#"*/}
            {/*          onClick={() => incrementCounter("goCounter", "goCounter")}*/}
            {/*          className={cn(*/}
            {/*            buttonVariants({ variant: "outline" }),*/}
            {/*            "group px-3 h-20 w-20 opacity-50 hover:fill-[#00acd7] hover:opacity-100 transition-all"*/}
            {/*          )}*/}
            {/*        >*/}
            {/*          <svg width="128" viewBox="0 0 128 128">*/}
            {/*            <g fillRule="evenodd">*/}
            {/*              <path d="M11.156 54.829c-.243 0-.303-.122-.182-.303l1.273-1.637c.12-.182.424-.303.666-.303H34.55c.243 0 .303.182.182.364l-1.03 1.576c-.121.181-.424.363-.606.363zM2.004 60.404c-.242 0-.303-.12-.182-.303l1.273-1.636c.121-.182.424-.303.667-.303h27.636c.242 0 .364.182.303.364l-.485 1.454c-.06.243-.303.364-.545.364zM16.67 65.98c-.242 0-.302-.182-.181-.364l.848-1.515c.122-.182.364-.363.607-.363h12.12c.243 0 .364.181.364.424l-.12 1.454c0 .243-.243.425-.425.425zM79.58 53.738c-3.819.97-6.425 1.697-10.182 2.666-.91.243-.97.303-1.758-.606-.909-1.03-1.576-1.697-2.848-2.303-3.819-1.878-7.516-1.333-10.97.91-4.121 2.666-6.242 6.605-6.182 11.514.06 4.849 3.394 8.849 8.182 9.516 4.121.545 7.576-.91 10.303-4 .545-.667 1.03-1.394 1.636-2.243H56.064c-1.272 0-1.575-.788-1.151-1.818.788-1.879 2.242-5.03 3.09-6.606.183-.364.607-.97 1.516-.97h22.06c-.12 1.637-.12 3.273-.363 4.91-.667 4.363-2.303 8.363-4.97 11.878-4.364 5.758-10.06 9.333-17.273 10.303-5.939.788-11.454-.364-16.302-4-4.485-3.394-7.03-7.879-7.697-13.454-.788-6.606 1.151-12.546 5.151-17.758 4.303-5.636 10-9.212 16.97-10.485 5.697-1.03 11.151-.363 16.06 2.97 3.212 2.121 5.515 5.03 7.03 8.545.364.546.122.849-.606 1.03z"></path>*/}
            {/*              <path*/}
            {/*                d="M99.64 87.253c-5.515-.122-10.546-1.697-14.788-5.334-3.576-3.09-5.818-7.03-6.545-11.697-1.091-6.848.787-12.909 4.909-18.302 4.424-5.819 9.757-8.849 16.97-10.122 6.181-1.09 12-.484 17.272 3.091 4.788 3.273 7.757 7.697 8.545 13.515 1.03 8.182-1.333 14.849-6.97 20.546-4 4.06-8.909 6.606-14.545 7.757-1.636.303-3.273.364-4.848.546zm14.424-24.485c-.06-.788-.06-1.394-.182-2-1.09-6-6.606-9.394-12.363-8.06-5.637 1.272-9.273 4.848-10.606 10.545-1.091 4.727 1.212 9.515 5.575 11.454 3.334 1.455 6.667 1.273 9.879-.363 4.788-2.485 7.394-6.364 7.697-11.576z"*/}
            {/*                fillRule="nonzero"*/}
            {/*              ></path>*/}
            {/*            </g>*/}
            {/*          </svg>*/}
            {/*        </a>*/}
            {/*      </div>*/}
            {/*      <code className="max-w-16 mt-2 truncate select-none">*/}
            {/*        {isLoading ? "..." : counters.goCounter || 0}*/}
            {/*      </code>*/}
            {/*    </div>*/}

            {/*    /!* PHP Counter *!/*/}
            {/*    <div className="flex flex-col items-center justify-center">*/}
            {/*      <div ref={svgRefsRef.current.phpCounter}>*/}
            {/*        <a*/}
            {/*          href="#"*/}
            {/*          onClick={() =>*/}
            {/*            incrementCounter("phpCounter", "phpCounter")*/}
            {/*          }*/}
            {/*          className={cn(*/}
            {/*            buttonVariants({ variant: "outline" }),*/}
            {/*            "group px-3 h-20 w-20 opacity-50 hover:fill-[#141414] hover:opacity-100 transition-all"*/}
            {/*          )}*/}
            {/*        >*/}
            {/*          <svg width="128" viewBox="0 0 128 128">*/}
            {/*            <path d="M64 30.332C28.654 30.332 0 45.407 0 64s28.654 33.668 64 33.668c35.345 0 64-15.075 64-33.668S99.346 30.332 64 30.332zm-5.982 9.81h7.293v.003l-1.745 8.968h6.496c4.087 0 6.908.714 8.458 2.139 1.553 1.427 2.017 3.737 1.398 6.93l-3.053 15.7h-7.408l2.902-14.929c.33-1.698.208-2.855-.365-3.473-.573-.617-1.793-.925-3.658-.925h-5.828L58.752 73.88h-7.291l6.557-33.738zM26.73 49.114h14.133c4.252 0 7.355 1.116 9.305 3.348 1.95 2.232 2.536 5.346 1.758 9.346-.32 1.649-.863 3.154-1.625 4.52-.763 1.364-1.76 2.613-2.99 3.745-1.468 1.373-3.098 2.353-4.891 2.936-1.794.585-4.08.875-6.858.875h-6.294l-1.745 8.97h-7.35l6.557-33.74zm57.366 0h14.13c4.252 0 7.353 1.116 9.303 3.348h.002c1.95 2.232 2.538 5.346 1.76 9.346-.32 1.649-.861 3.154-1.623 4.52-.763 1.364-1.76 2.613-2.992 3.745-1.467 1.373-3.098 2.353-4.893 2.936-1.794.585-4.077.875-6.855.875h-6.295l-1.744 8.97h-7.35l6.557-33.74zm-51.051 5.325-2.742 14.12h4.468c2.963 0 5.172-.556 6.622-1.673 1.45-1.116 2.428-2.981 2.937-5.592.485-2.507.264-4.279-.666-5.309-.93-1.032-2.79-1.547-5.584-1.547h-5.035zm57.363 0-2.744 14.12h4.47c2.965 0 5.17-.556 6.622-1.673 1.449-1.116 2.427-2.981 2.935-5.592.487-2.507.266-4.279-.664-5.309-.93-1.032-2.792-1.547-5.584-1.547h-5.035z"></path>*/}
            {/*          </svg>*/}
            {/*        </a>*/}
            {/*      </div>*/}
            {/*      <code className="max-w-16 mt-2 truncate select-none">*/}
            {/*        {isLoading ? "..." : counters.phpCounter || 0}*/}
            {/*      </code>*/}
            {/*    </div>*/}
            {/*    <div className="flex flex-col items-center justify-center">*/}
            {/*      <a*/}
            {/*        href="https://www.seahorse.dev/"*/}
            {/*        target="_blank"*/}
            {/*        className={cn(*/}
            {/*          buttonVariants({ variant: "outline" }),*/}
            {/*          "group px-3 h-20 w-20 opacity-50 hover:fill-[#EF8B8E] hover:opacity-100 transition-all"*/}
            {/*        )}*/}
            {/*      >*/}
            {/*        <svg width="128" viewBox="0 0 128 128">*/}
            {/*          <path d="M49.33 62h29.159C86.606 62 93 55.132 93 46.981V19.183c0-7.912-6.632-13.856-14.555-15.176-5.014-.835-10.195-1.215-15.187-1.191-4.99.023-9.612.448-13.805 1.191C37.098 6.188 35 10.758 35 19.183V30h29v4H23.776c-8.484 0-15.914 5.108-18.237 14.811-2.681 11.12-2.8 17.919 0 29.53C7.614 86.983 12.569 93 21.054 93H31V79.952C31 70.315 39.428 62 49.33 62zm-1.838-39.11c-3.026 0-5.478-2.479-5.478-5.545 0-3.079 2.451-5.581 5.478-5.581 3.015 0 5.479 2.502 5.479 5.581-.001 3.066-2.465 5.545-5.479 5.545zm74.789 25.921C120.183 40.363 116.178 34 107.682 34H97v12.981C97 57.031 88.206 65 78.489 65H49.33C41.342 65 35 72.326 35 80.326v27.8c0 7.91 6.745 12.564 14.462 14.834 9.242 2.717 17.994 3.208 29.051 0C85.862 120.831 93 116.549 93 108.126V97H64v-4h43.682c8.484 0 11.647-5.776 14.599-14.66 3.047-9.145 2.916-17.799 0-29.529zm-41.955 55.606c3.027 0 5.479 2.479 5.479 5.547 0 3.076-2.451 5.579-5.479 5.579-3.015 0-5.478-2.502-5.478-5.579 0-3.068 2.463-5.547 5.478-5.547z"></path>*/}
            {/*        </svg>*/}
            {/*      </a>*/}
            {/*      <code className="mt-2 select-none">Seahorse</code>{" "}*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

export default Hero12;
