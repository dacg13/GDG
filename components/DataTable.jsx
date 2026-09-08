"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { CheckBoxComp } from "./CheckBoxComp";
import { toast } from "sonner";
import { curDate, curDay, curMonth, curYear, months } from "@/constants";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
  useRowSelect,
} from "react-table";
import Input from "@/components/ui/input";
import PaginationComp from "./PaginationComp";
import SummaryTile from "@/components/ui/SummaryTile";
import StatusBadge from "@/components/ui/StatusBadge";
import TicketStub from "@/components/ui/TicketStub";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { CSVLink } from "react-csv";
import { CSV_Header, reviews } from "@/constants";
import {
  Search,
  RotateCcw,
  Download,
  Mail,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowUpDown,
  FileText,
  User,
} from "lucide-react";

export default function DataTable({ data = [] }) {
  const [tableData, setTableData] = useState(data);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Review Drawer State
  const [drawerApplicant, setDrawerApplicant] = useState(null);

  // Bulk Email Confirmation Modal State (Item 3 from user review)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  // Reconcile filters client-side
  useEffect(() => {
    let filtered = [...data];

    if (selectedDeptFilter !== "ALL") {
      filtered = filtered.filter((item) => item.Department === selectedDeptFilter);
    }

    if (selectedStatusFilter !== "ALL") {
      if (selectedStatusFilter === "SHORTLISTED") {
        filtered = filtered.filter((item) => !!item.shortlisted);
      } else if (selectedStatusFilter === "PENDING") {
        filtered = filtered.filter((item) => !item.shortlisted);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.Name?.toLowerCase().includes(q) ||
          item.RegistrationNumber?.toLowerCase().includes(q) ||
          item.Email?.toLowerCase().includes(q) ||
          item.Department?.toLowerCase().includes(q)
      );
    }

    setTableData(filtered);
  }, [data, selectedDeptFilter, selectedStatusFilter, searchQuery]);

  // Aggregate metrics for SummaryTiles
  const totalApplicants = data.length;
  const shortlistedCount = data.filter((item) => !!item.shortlisted).length;
  const underReviewCount = data.filter((item) => !item.shortlisted).length;

  const handleShortlist = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const res = await fetch(`/api/shortlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortlisted: nextStatus }),
      });

      if (res.ok) {
        setTableData((prev) =>
          prev.map((applicant) =>
            applicant._id === id ? { ...applicant, shortlisted: nextStatus } : applicant
          )
        );
        if (drawerApplicant && drawerApplicant._id === id) {
          setDrawerApplicant((prev) => ({ ...prev, shortlisted: nextStatus }));
        }
        toast.success(
          nextStatus ? "Applicant added to shortlist" : "Applicant removed from shortlist"
        );
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      console.error("Shortlist update error:", err);
      toast.error("Network error while updating status.");
    }
  };

  const handleResetFilters = () => {
    setSelectedDeptFilter("ALL");
    setSelectedStatusFilter("ALL");
    setSearchQuery("");
  };

  // Columns definition
  const columns = useMemo(
    () => [
      {
        Header: "SR",
        accessor: (row, index) => index + 1,
        Cell: ({ value }) => (
          <span className="font-mono text-xs text-[var(--color-ink-muted)]">
            {String(value).padStart(2, "0")}
          </span>
        ),
      },
      {
        Header: "CANDIDATE",
        accessor: "Name",
        Cell: ({ row }) => (
          <div>
            <div className="font-body text-sm font-semibold text-[var(--color-ink)]">
              {row.original.Name || "Anonymous"}
            </div>
            <div className="font-mono text-xs text-[var(--color-ink-muted)]">
              {row.original.Email}
            </div>
          </div>
        ),
      },
      {
        Header: "REGISTRATION",
        accessor: "RegistrationNumber",
        Cell: ({ value }) => (
          <span className="font-mono text-xs font-semibold text-[var(--color-ink)] uppercase">
            {value || "—"}
          </span>
        ),
      },
      {
        Header: "TRACK / PREF",
        accessor: "Department",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-[var(--color-ink)] font-medium">
              {row.original.Department}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-[10px] text-[var(--color-ink-muted)] font-semibold">
              P{row.original.Pref || "1"}
            </span>
          </div>
        ),
      },
      {
        Header: "STATUS",
        accessor: "shortlisted",
        Cell: ({ value }) => (
          <StatusBadge status={value ? "shortlisted" : "under review"} />
        ),
      },
      {
        Header: "ACTIONS",
        id: "actions",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleShortlist(row.original._id, row.original.shortlisted)
              }
              className={`px-2.5 py-1 rounded-[var(--radius-button)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                row.original.shortlisted
                  ? "border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)]"
                  : "bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90"
              }`}
            >
              {row.original.shortlisted ? "Unshortlist" : "Shortlist"}
            </button>
            <button
              type="button"
              onClick={() => setDrawerApplicant(row.original)}
              aria-label={`View dossier for ${row.original.Name}`}
              className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius-button)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: { pageSize: 15 },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((cols) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <CheckBoxComp {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <CheckBoxComp {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...cols,
      ]);
    }
  );

  const { pageIndex } = state;
  const selectedApplicants = selectedFlatRows.map((r) => r.original);

  // Bulk Email Confirmation Handler
  const handleConfirmEmailDispatch = async () => {
    setIsSendingEmails(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: selectedApplicants,
          payloadData: {
            date: `${months[curMonth]} ${curDate}, ${curYear}`,
          },
        }),
      });

      if (response.ok) {
        toast.success(`Dispatched invitations to ${selectedApplicants.length} applicants.`);
        setIsEmailModalOpen(false);
      } else {
        toast.error("Failed to send invitations. Please verify server credentials.");
      }
    } catch (err) {
      console.error("Bulk email error:", err);
      toast.error("Network error during bulk dispatch.");
    } finally {
      setIsSendingEmails(false);
    }
  };

  const formatQuestionsForCsv = (item) => {
    if (!item?.Questions) return "";
    if (typeof item.Questions === "object") {
      return Object.entries(item.Questions)
        .map(([q, a]) => `${q}: ${a}`)
        .join(" | ");
    }
    return String(item.Questions);
  };

  const csvData = {
    headers: CSV_Header,
    data: tableData.map((item) => ({
      ...item,
      Questions: formatQuestionsForCsv(item),
    })),
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Quiet Control-Tower Summary Tiles per designing.md 5.3.3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryTile
          label="Total Registered"
          value={totalApplicants}
          secondary="Candidates"
        />
        <SummaryTile
          label="Under Review"
          value={underReviewCount}
          secondary="Evaluating"
        />
        <SummaryTile
          label="Shortlisted"
          value={shortlistedCount}
          secondary="Next Round"
        />
      </div>

      {/* 2. Compact Single-Line Filter Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Instant Search with Live Mono Counter */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidate, reg, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] font-body text-xs text-[var(--color-ink)] focus:outline-none focus:border-2 focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] font-body text-xs text-[var(--color-ink)] focus:outline-none focus:border-2 focus:border-[var(--color-primary)]"
          >
            <option value="ALL">All Departments</option>
            {reviews.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] font-body text-xs text-[var(--color-ink)] focus:outline-none focus:border-2 focus:border-[var(--color-primary)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="PENDING">Under Review</option>
          </select>

          {/* Reset Action */}
          {(selectedDeptFilter !== "ALL" ||
            selectedStatusFilter !== "ALL" ||
            searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 h-10 px-3 font-mono text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-border)] rounded-[var(--radius-input)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Live Result Count */}
          <span className="font-mono text-xs text-[var(--color-ink-muted)] ml-2">
            SHOWING {tableData.length} OF {totalApplicants}
          </span>
        </div>

        {/* Bulk Actions & CSV Export */}
        <div className="flex items-center gap-3">
          {selectedApplicants.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEmailModalOpen(true)}
              className="gap-2 text-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Dispatch Invites ({selectedApplicants.length})</span>
            </Button>
          )}

          <CSVLink
            {...csvData}
            filename={`gdg-applicants-${new Date().toISOString().split("T")[0]}.csv`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-bg)] font-body text-xs uppercase font-medium tracking-wider transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </CSVLink>
        </div>
      </div>

      {/* 3. Dense Scannable Table (Desktop & Tablet) */}
      <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] overflow-hidden">
        <Table {...getTableProps()}>
          <TableHeader className="bg-[var(--color-bg)] border-b border-[var(--color-border)] sticky top-0 z-10">
            {headerGroups.map((hg) => (
              <TableRow key={hg.id} {...hg.getHeaderGroupProps()}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    {...header.getHeaderProps(header.getSortByToggleProps())}
                    className="font-mono text-xs text-[var(--color-ink-muted)] uppercase tracking-wider py-3"
                  >
                    <div className="flex items-center gap-1.5 cursor-pointer select-none">
                      {header.render("Header")}
                      {header.isSorted ? (
                        <ArrowUpDown className="w-3 h-3 text-[var(--color-primary)]" />
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody {...getTableBodyProps()}>
            {page.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-12"
                >
                  <p className="font-body text-sm text-[var(--color-ink-muted)]">
                    No applicant records match your current filter parameters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              page.map((row) => {
                prepareRow(row);
                return (
                  <TableRow
                    key={row.id}
                    {...row.getRowProps()}
                    className="h-14 border-b border-[var(--color-border)]/60 odd:bg-[var(--color-surface)] even:bg-[var(--color-primary)]/[0.03] hover:bg-[var(--color-accent)]/10 transition-colors"
                  >
                    {row.cells.map((cell) => (
                      <TableCell
                        key={cell.column.id || cell.id}
                        {...cell.getCellProps()}
                        className="py-2 px-4"
                      >
                        {cell.render("Cell")}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <PaginationComp
            pageIndex={pageIndex}
            pages={pageOptions.length}
            nextPage={nextPage}
            canNext={canNextPage}
            previousPage={previousPage}
            canPrev={canPreviousPage}
            goto={gotoPage}
            pageCount={pageCount}
          />
        </div>
      </div>

      {/* 4. Mobile Stacked-Card Fallback (<768px per designing.md Section 6 & 11) */}
      <div className="md:hidden space-y-4">
        {page.length === 0 ? (
          <EmptyState
            title="No Records Found"
            description="No candidates match your current filter criteria."
          />
        ) : (
          page.map((row) => {
            const applicant = row.original;
            return (
              <TicketStub
                key={applicant._id || applicant.id}
                variant="compact"
                stub={
                  <div className="flex flex-col justify-between h-full space-y-2">
                    <StatusBadge
                      status={applicant.shortlisted ? "shortlisted" : "under review"}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleShortlist(applicant._id, applicant.shortlisted)
                      }
                      className={`w-full py-1.5 rounded-[var(--radius-button)] font-mono text-xs font-semibold uppercase tracking-wider ${
                        applicant.shortlisted
                          ? "border border-[var(--color-border)] text-[var(--color-ink-muted)]"
                          : "bg-[var(--color-success)] text-white"
                      }`}
                    >
                      {applicant.shortlisted ? "Unshortlist" : "Shortlist"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerApplicant(applicant)}
                      className="w-full text-center text-xs font-mono text-[var(--color-primary)] underline py-1"
                    >
                      View Answers
                    </button>
                  </div>
                }
              >
                <div>
                  <div className="font-body font-semibold text-sm text-[var(--color-ink)]">
                    {applicant.Name || "Candidate"}
                  </div>
                  <div className="font-mono text-xs text-[var(--color-ink-muted)]">
                    {applicant.RegistrationNumber} · {applicant.Department} (P{applicant.Pref || "1"})
                  </div>
                  <div className="font-mono text-xs text-[var(--color-ink-muted)] mt-1 truncate">
                    {applicant.Email}
                  </div>
                </div>
              </TicketStub>
            );
          })
        )}

        <div className="pt-2">
          <PaginationComp
            pageIndex={pageIndex}
            pages={pageOptions.length}
            nextPage={nextPage}
            canNext={canNextPage}
            previousPage={previousPage}
            canPrev={canPreviousPage}
            goto={gotoPage}
            pageCount={pageCount}
          />
        </div>
      </div>

      {/* 5. Applicant Review Slide-Over Drawer per designing.md Section 5.7 */}
      {drawerApplicant && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setDrawerApplicant(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] rounded-l-[var(--radius-panel)] shadow-[var(--shadow-modal)] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                      APPLICANT DOSSIER · GATE {drawerApplicant.Pref || "1"}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-1">
                      {drawerApplicant.Name}
                    </h2>
                    <p className="font-mono text-xs text-[var(--color-ink-muted)]">
                      {drawerApplicant.RegistrationNumber} · {drawerApplicant.Department}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerApplicant(null)}
                    className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                    aria-label="Close dossier"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                  <StatusBadge
                    status={drawerApplicant.shortlisted ? "shortlisted" : "under review"}
                  />
                  <Button
                    variant={drawerApplicant.shortlisted ? "secondary" : "primary"}
                    size="sm"
                    onClick={() =>
                      handleShortlist(
                        drawerApplicant._id,
                        drawerApplicant.shortlisted
                      )
                    }
                  >
                    {drawerApplicant.shortlisted ? "Unshortlist" : "Mark Shortlisted"}
                  </Button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="p-6 flex-1 space-y-6">
                <div>
                  <div className="font-mono text-xs uppercase font-semibold text-[var(--color-ink-muted)] mb-3">
                    CONTACT PARTICULARS
                  </div>
                  <div className="bg-[var(--color-bg)] p-4 rounded-[var(--radius-sharp)] border border-[var(--color-border)] text-xs font-mono space-y-2">
                    <div>
                      <span className="text-[var(--color-ink-muted)]">EMAIL: </span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        {drawerApplicant.Email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-muted)]">PHONE: </span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        {drawerApplicant.Phone || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-muted)]">GENDER: </span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        {drawerApplicant.Gender || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-muted)]">YEAR OF STUDY: </span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        {drawerApplicant["Year of Study"] || "1st Year"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submitted Questionnaire Responses */}
                <div>
                  <div className="font-mono text-xs uppercase font-semibold text-[var(--color-ink-muted)] mb-3">
                    RECORDED QUESTIONNAIRE RESPONSES
                  </div>
                  {drawerApplicant.Questions &&
                  typeof drawerApplicant.Questions === "object" ? (
                    <div className="space-y-3">
                      {Object.entries(drawerApplicant.Questions).map(
                        ([question, answer]) => (
                          <div
                            key={question}
                            className="p-3.5 bg-[var(--color-bg)] rounded-[var(--radius-sharp)] border border-[var(--color-border)] text-xs"
                          >
                            <div className="font-semibold text-[var(--color-ink)] mb-1">
                              {question}
                            </div>
                            <div className="font-body text-[var(--color-ink-muted)] whitespace-pre-wrap leading-relaxed">
                              {String(answer) || (
                                <span className="italic opacity-50">Not answered</span>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="font-body text-xs text-[var(--color-ink-muted)] italic">
                      No question data available for this applicant.
                    </p>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] text-right">
                <Button variant="ghost" size="sm" onClick={() => setDrawerApplicant(null)}>
                  Close Dossier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bulk Email Safety Confirmation Modal (Item 3 from user review) */}
      <Modal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        title="Confirm Invitation Dispatch"
        description={`You are about to transmit official recruitment invitations to ${selectedApplicants.length} selected candidate(s). This action dispatches outgoing notification emails immediately.`}
        confirmLabel="Confirm & Dispatch"
        cancelLabel="Cancel"
        isLoading={isSendingEmails}
        onConfirm={handleConfirmEmailDispatch}
      >
        <div className="p-3 bg-[var(--color-bg)] rounded-[var(--radius-sharp)] border border-[var(--color-border)] text-xs font-mono max-h-40 overflow-y-auto space-y-1">
          {selectedApplicants.map((applicant, idx) => (
            <div key={applicant._id || idx} className="truncate">
              {idx + 1}. {applicant.Name} &lt;{applicant.Email}&gt; ({applicant.Department})
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
