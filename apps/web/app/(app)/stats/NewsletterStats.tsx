"use client";

import React, { useState } from "react";
import useSWR from "swr";
import clsx from "clsx";
import {
  Card,
  ProgressBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Title,
  Text,
} from "@tremor/react";
import {
  ArchiveIcon,
  ArchiveXIcon,
  BadgeCheckIcon,
  ChevronDown,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ExpandIcon,
  FilterIcon,
  HelpCircleIcon,
  SquareSlashIcon,
  UserRoundMinusIcon,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { LoadingContent } from "@/components/LoadingContent";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NewsletterStatsQuery,
  NewsletterStatsResponse,
} from "@/app/api/user/stats/newsletters/route";
import { useExpanded } from "@/app/(app)/stats/useExpanded";
import { Button } from "@/components/ui/button";
import { getDateRangeParams } from "@/app/(app)/stats/params";
import { NewsletterModal } from "@/app/(app)/stats/NewsletterModal";
import { Tooltip } from "@/components/Tooltip";
import {
  EmailsToIncludeFilter,
  useEmailsToIncludeFilter,
} from "@/app/(app)/stats/EmailsToIncludeFilter";
import { onAutoArchive, onDeleteFilter } from "@/utils/actions-client";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LabelsResponse } from "@/app/api/google/labels/route";
import { DetailedStatsFilter } from "@/app/(app)/stats/DetailedStatsFilter";
import { setNewsletterStatus } from "@/utils/actions";

export function NewsletterStats(props: {
  dateRange?: DateRange | undefined;
  refreshInterval: number;
}) {
  const [sortColumn, setSortColumn] = useState<
    "emails" | "unread" | "unarchived"
  >("emails");

  const { typesArray, types, setTypes } = useEmailsToIncludeFilter();
  const { filtersArray, filters, setFilters } = useNewsletterFilter();

  const params: NewsletterStatsQuery = {
    types: typesArray,
    filters: filtersArray,
    orderBy: sortColumn,
    limit: 100,
    ...getDateRangeParams(props.dateRange),
  };

  const urlParams = new URLSearchParams(params as any);

  const { data, isLoading, error, mutate } = useSWR<
    NewsletterStatsResponse,
    { error: string }
  >(`/api/user/stats/newsletters?${urlParams}`, {
    refreshInterval: props.refreshInterval,
    keepPreviousData: true,
  });

  const { data: dataLabels } = useSWR<LabelsResponse>("/api/google/labels");

  const { expanded, extra } = useExpanded();
  const [selectedNewsletter, setSelectedNewsletter] =
    React.useState<NewsletterStatsResponse["newsletters"][number]>();

  const [selectedRow, setSelectedRow] = React.useState<
    NewsletterStatsResponse["newsletters"][number] | undefined
  >();

  // perform actions using keyboard shortcuts
  // TODO make this available to command-K dialog too
  React.useEffect(() => {
    const down = async (e: KeyboardEvent) => {
      const item = selectedRow;
      if (!item) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const index = data?.newsletters?.findIndex((n) => n.name === item.name);
        if (index === undefined) return;
        const nextItem =
          data?.newsletters?.[index + (e.key === "ArrowDown" ? 1 : -1)];
        if (!nextItem) return;
        setSelectedRow(nextItem);
        return;
      } else if (e.key === "e") {
        // auto archive
        e.preventDefault();
        onAutoArchive(item.name);
        await setNewsletterStatus({
          newsletterEmail: item.name,
          status: "AUTO_ARCHIVED",
        });
        mutate();
      } else if (e.key === "u") {
        // unsubscribe
        e.preventDefault();
        await setNewsletterStatus({
          newsletterEmail: item.name,
          status: "UNSUBSCRIBED",
        });
        mutate();
        window.open(item.lastUnsubscribeLink, "_blank");
      } else if (e.key === "a") {
        // approve
        e.preventDefault();
        await setNewsletterStatus({
          newsletterEmail: item.name,
          status: "APPROVED",
        });
        mutate();
      } else if (e.key === "Enter") {
        // open modal
        e.preventDefault();
        setSelectedNewsletter(item);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [mutate, data?.newsletters, selectedRow]);

  return (
    <>
      <Card className="p-0">
        <div className="items-center justify-between px-6 pt-6 md:flex">
          <div className="">
            <Title>
              Which newsletters and marketing emails do you get the most?
            </Title>
            <Text className="mt-2">
              A list of are your email subscriptions. Quickly unsubscribe or
              view the emails in more detail.
            </Text>
          </div>
          <div className="ml-4 mt-2 flex space-x-2 md:mt-0">
            <Tooltip
              contentComponent={
                <div>
                  <h3 className="mb-1 font-semibold">Shortcuts:</h3>
                  <p>U - Unsubscribe</p>
                  <p>E - Auto Archive</p>
                  <p>A - Approve</p>
                  <p>Enter - View more</p>
                  <p>Up/down - navigate</p>
                </div>
              }
            >
              <Button size="icon" variant="link">
                <SquareSlashIcon className="h-5 w-5" />
              </Button>
            </Tooltip>

            <DetailedStatsFilter
              label="Filter"
              icon={<FilterIcon className="mr-2 h-4 w-4" />}
              keepOpenOnSelect
              columns={[
                {
                  label: "Unhandled",
                  checked: filters.unhandled,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      ["unhandled"]: !filters.unhandled,
                    }),
                },
                {
                  label: "Auto Archived",
                  checked: filters.autoArchived,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      ["autoArchived"]: !filters.autoArchived,
                    }),
                },
                {
                  label: "Unsubscribed",
                  checked: filters.unsubscribed,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      ["unsubscribed"]: !filters.unsubscribed,
                    }),
                },
                {
                  label: "Approved",
                  checked: filters.approved,
                  setChecked: () =>
                    setFilters({ ...filters, ["approved"]: !filters.approved }),
                },
              ]}
            />

            <EmailsToIncludeFilter types={types} setTypes={setTypes} />
          </div>
        </div>

        <LoadingContent
          loading={!data && isLoading}
          error={error}
          loadingComponent={<Skeleton className="m-4 h-screen rounded" />}
        >
          {data && (
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="pl-6">
                    <span className="text-sm font-medium">From</span>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <HeaderButton
                      sorted={sortColumn === "emails"}
                      onClick={() => setSortColumn("emails")}
                    >
                      Emails
                    </HeaderButton>
                  </TableHeaderCell>
                  <TableHeaderCell className="hidden lg:table-cell">
                    <HeaderButton
                      sorted={sortColumn === "unread"}
                      onClick={() => setSortColumn("unread")}
                    >
                      Read
                    </HeaderButton>
                  </TableHeaderCell>
                  <TableHeaderCell className="hidden md:table-cell">
                    <HeaderButton
                      sorted={sortColumn === "unarchived"}
                      onClick={() => setSortColumn("unarchived")}
                    >
                      Archived
                    </HeaderButton>
                  </TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.newsletters
                  .slice(0, expanded ? undefined : 50)
                  .map((item) => (
                    <NewsletterRow
                      key={item.name}
                      item={item}
                      setSelectedNewsletter={setSelectedNewsletter}
                      gmailLabels={dataLabels}
                      mutate={mutate}
                      selected={selectedRow?.name === item.name}
                      onSelectRow={() => {
                        setSelectedRow(item);
                      }}
                    />
                  ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-2 px-6 pb-6">{extra}</div>
        </LoadingContent>
      </Card>
      <NewsletterModal
        newsletter={selectedNewsletter}
        onClose={() => setSelectedNewsletter(undefined)}
        refreshInterval={props.refreshInterval}
      />
    </>
  );
}

function NewsletterRow(props: {
  item: NewsletterStatsResponse["newsletters"][number];
  setSelectedNewsletter: React.Dispatch<
    React.SetStateAction<
      NewsletterStatsResponse["newsletters"][number] | undefined
    >
  >;
  gmailLabels?: LabelsResponse;
  mutate: () => Promise<NewsletterStatsResponse | undefined>;
  selected: boolean;
  onSelectRow: () => void;
}) {
  const { item } = props;
  const readPercentage = (item.readEmails / item.value) * 100;
  const archivedEmails = item.value - item.inboxEmails;
  const archivedPercentage = (archivedEmails / item.value) * 100;

  return (
    <TableRow
      key={item.name}
      className={props.selected ? "bg-blue-50" : undefined}
      aria-selected={props.selected || undefined}
      data-selected={props.selected || undefined}
      onMouseEnter={props.onSelectRow}
    >
      <TableCell className="max-w-[250px] truncate pl-6 xl:max-w-[300px] 2xl:max-w-none">
        {item.name}
      </TableCell>
      <TableCell>{item.value}</TableCell>
      <TableCell className="hidden lg:table-cell">
        <ProgressBar
          label={`${Math.round(readPercentage)}%`}
          value={readPercentage}
          tooltip={`${item.readEmails} read. ${
            item.value - item.readEmails
          } unread.`}
          color="blue"
          className="w-[150px]"
        />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <ProgressBar
          label={`${Math.round(archivedPercentage)}%`}
          value={archivedPercentage}
          tooltip={`${archivedEmails} archived. ${item.inboxEmails} unarchived.`}
          color="blue"
          className="w-[150px]"
        />
      </TableCell>
      <TableCell className="flex justify-end space-x-2 p-2">
        <Button
          size="sm"
          variant={item.status === "UNSUBSCRIBED" ? "red" : "secondary"}
          disabled={!item.lastUnsubscribeLink}
          asChild={!!item.lastUnsubscribeLink}
        >
          <a
            href={item.lastUnsubscribeLink}
            target="_blank"
            onClick={async () => {
              await setNewsletterStatus({
                newsletterEmail: item.name,
                status: "UNSUBSCRIBED",
              });
              props.mutate();
            }}
          >
            <span className="hidden xl:block">Unsubscribe</span>
            <span className="block xl:hidden">
              <UserRoundMinusIcon className="h-4 w-4" />
            </span>
          </a>
        </Button>
        <Tooltip content="Auto archive emails using Gmail filters.">
          <div
            className={clsx(
              "flex items-center space-x-1 rounded-md text-secondary-foreground",
              item.autoArchived ? "bg-blue-100" : "bg-secondary",
            )}
          >
            <Button
              variant={
                item.status === "AUTO_ARCHIVED" || item.autoArchived
                  ? "blue"
                  : "secondary"
              }
              className="px-3 shadow-none"
              size="sm"
              onClick={async () => {
                onAutoArchive(item.name);
                await setNewsletterStatus({
                  newsletterEmail: item.name,
                  status: "AUTO_ARCHIVED",
                });
                props.mutate();
              }}
            >
              <span className="hidden xl:block">Auto Archive</span>
              <span className="block xl:hidden">
                <ArchiveIcon className="h-4 w-4" />
              </span>
            </Button>
            <Separator orientation="vertical" className="h-[20px]" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={
                    item.status === "AUTO_ARCHIVED" || item.autoArchived
                      ? "blue"
                      : "secondary"
                  }
                  className="px-2 shadow-none"
                  size="sm"
                >
                  <ChevronDownIcon className="h-4 w-4 text-secondary-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                alignOffset={-5}
                className="max-h-[415px] w-[220px] overflow-auto"
                forceMount
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
              >
                {item.autoArchived?.id && (
                  <>
                    <DropdownMenuItem
                      onClick={async () => {
                        onDeleteFilter(item.autoArchived?.id!);
                        await setNewsletterStatus({
                          newsletterEmail: item.name,
                          status: null,
                        });
                        props.mutate();
                      }}
                    >
                      <ArchiveXIcon className="mr-2 h-4 w-4" /> Disable Auto
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuLabel>Auto Archive and Label</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {props.gmailLabels?.labels
                  ?.filter(
                    (l) =>
                      l.id &&
                      l.type === "user" &&
                      l.labelListVisibility === "labelShow",
                  )
                  .map((label) => {
                    return (
                      <DropdownMenuItem
                        key={label.id}
                        onClick={async () => {
                          onAutoArchive(item.name, label.id || undefined);
                          await setNewsletterStatus({
                            newsletterEmail: item.name,
                            status: "AUTO_ARCHIVED",
                          });
                          props.mutate();
                        }}
                      >
                        {label.name}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Tooltip>
        <Button
          size="sm"
          variant={item.status === "APPROVED" ? "green" : "secondary"}
          onClick={async () => {
            await setNewsletterStatus({
              newsletterEmail: item.name,
              status: "APPROVED",
            });
            props.mutate();
          }}
        >
          <span className="hidden 2xl:block">Approve</span>
          <span className="block 2xl:hidden">
            <BadgeCheckIcon className="h-4 w-4" />
          </span>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => props.setSelectedNewsletter(item)}
        >
          <ExpandIcon className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function HeaderButton(props: {
  children: React.ReactNode;
  sorted: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={props.onClick}
    >
      <span>{props.children}</span>
      {props.sorted ? (
        <ChevronDown className="ml-2 h-4 w-4" />
      ) : (
        <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

function useNewsletterFilter() {
  const [filters, setFilters] = useState<
    Record<"unhandled" | "autoArchived" | "unsubscribed" | "approved", boolean>
  >({
    unhandled: true,
    autoArchived: false,
    unsubscribed: false,
    approved: false,
  });

  return {
    filters,
    filtersArray: Object.entries(filters)
      .filter(([, selected]) => selected)
      .map(([key]) => key) as (
      | "unhandled"
      | "autoArchived"
      | "unsubscribed"
      | "approved"
    )[],
    setFilters,
  };
}
