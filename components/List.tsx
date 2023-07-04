import { useState } from "react";
import { useChat } from "ai/react";
import useSWR from "swr";
import { LoadingContent } from "@/components/LoadingContent";
import { Button } from "./Button";
import { ThreadResponse } from "@/app/api/google/threads/[id]/route";
import { postRequest } from "@/utils/api";
import { ClassifyThreadResponse } from "@/app/api/ai/classify/route";
import { useNotification } from "@/components/NotificationProvider";

type Item = { id: string; text: string };

export function List(props: {
  items: Item[];
  onArchive: (id: string) => void;
}) {
  const { items } = props;

  return (
    <ul role="list" className="divide-y divide-gray-800">
      {items.map((item) => (
        <ListItem key={item.id} item={item} onArchive={props.onArchive} />
      ))}
    </ul>
  );
}

function ListItem(props: { item: Item; onArchive: (id: string) => void }) {
  const { item, onArchive } = props;

  const { data, isLoading, error } = useSWR<ThreadResponse>(
    `/api/google/threads/${item.id}`
  );
  const [category, setCategory] = useState<string>();

  return (
    <li className="flex py-5 text-white">
      <div className="max-w-full">
        <p className="text-sm font-semibold leading-6 text-white break-words whitespace-pre-wrap">
          {item.text}
        </p>
        <LoadingContent loading={isLoading} error={error}>
          {data && (
            <>
              <p className="mt-1 truncate text-xs leading-5 text-gray-400 break-words whitespace-pre-wrap">
                {data.thread.messages?.[0]?.text.substring(0, 280) ||
                  "No message text"}
              </p>
              <div className="space-x-2">
                <Button
                  color="white"
                  onClick={async () => {
                    const category = await postRequest<ClassifyThreadResponse>(
                      "/api/ai/classify",
                      {
                        message: data.thread.messages?.[0]?.text || "",
                      }
                    );

                    setCategory(category.message);
                  }}
                >
                  Categorise
                </Button>
                {category && <div>Category: {category}</div>}
                <ResponseMessage
                  message={data.thread.messages?.[0]?.text || ""}
                />
              </div>
            </>
          )}
        </LoadingContent>
      </div>
      <div className="">
        <Button onClick={() => onArchive(item.id)}>Archive</Button>
      </div>
    </li>
  );
}

function ResponseMessage(props: { message: string }) {
  const { showNotification } = useNotification();

  const { messages, handleSubmit, isLoading } = useChat({
    api: "/api/ai/respond",
    body: { message: props.message },
    initialInput: " ", // to allow submit to happen. not used
    onResponse: (response) => {
      if (response.status === 429) {
        showNotification({
          type: "error",
          description: "You have reached your request limit for the day.",
        });
        // va.track("Rate limited");
        return;
      } else {
        // va.track("Response requested");
      }
    },
    onError: (error) => {
      showNotification({
        type: "error",
        description: `There was an error: ${error.message}`,
      });
      // va.track("Response errored", {
      //   input,
      //   error: error.message,
      // });
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Button color="white" type="submit">
          Respond
        </Button>
      </form>
      {!!messages.length && (
        <div>Response: {messages[messages.length - 1].content}</div>
      )}
    </>
  );
}