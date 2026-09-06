"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import Button from "./ui/button";
import Input from "./ui/input";
import Textarea from "./ui/textarea";
import TicketStub from "./ui/TicketStub";
import { QuestionnaireData } from "@/constants";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useSubmissions } from "@/components/SubmissionsProvider";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";

const normaliseQuestion = (question) =>
  typeof question === "string"
    ? { name: question, type: "generic", placeholder: "2-3 sentences" }
    : question;

export default function FormComp({ dept1, dept2, isLoading, setIsLoading }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const isSignedIn = !!user;

  const { submittedDepartments: contextSubmitted, markDepartmentsSubmitted } =
    useSubmissions();

  // Multi-step navigation state
  const [currentStep, setCurrentStep] = useState(0); // 0: About You, 1: Dept 1, 2: Dept 2 (if exists), last: Review
  const [slideDirection, setSlideDirection] = useState("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessData, setSubmissionSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState("");

  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [isDraftReady, setIsDraftReady] = useState(false);

  // Department names in explicit order: dept1 is primary (Pref: 1), dept2 is secondary (Pref: 2)
  const departmentNames = useMemo(
    () =>
      [dept1, dept2]
        .filter(Boolean)
        .map((department) =>
          typeof department === "string" ? department : department.name
        ),
    [dept1, dept2]
  );

  const draftKey =
    user?.email && departmentNames.length
      ? `recruitment-draft:${user.email}:${[...departmentNames].sort().join("|")}`
      : null;

  // Build steps array dynamically
  const formSteps = useMemo(() => {
    const steps = [
      { id: "personal", title: "About You", subtitle: "Personal Details" },
      {
        id: "dept1",
        title: departmentNames[0] || "Track 1",
        subtitle: "1st Choice Track",
      },
    ];
    if (departmentNames[1]) {
      steps.push({
        id: "dept2",
        title: departmentNames[1],
        subtitle: "2nd Choice Track",
      });
    }
    steps.push({ id: "review", title: "Review", subtitle: "Boarding Pass Preview" });
    return steps;
  }, [departmentNames]);

  const totalSteps = formSteps.length;
  const isReviewStep = currentStep === totalSteps - 1;

  // Question mappings
  const normalizeDeptName = (str) =>
    str ? str.trim().toLowerCase().replace(/\s*\/\s*/g, "/") : "";

  const getDeptQuestions = (deptName) => {
    if (!deptName) return [];
    return (
      QuestionnaireData.find(
        (item) => normalizeDeptName(item.department) === normalizeDeptName(deptName)
      )?.questions ?? []
    )
      .map(normaliseQuestion)
      .filter(
        (q) =>
          q.name !== "Why do you want to join Organization Name?" &&
          q.name !== "Why do you want to join DWASFW?"
      );
  };

  const allQuestionNames = useMemo(
    () => [
      ...new Set(
        departmentNames.flatMap((department) =>
          (
            QuestionnaireData.find(
              (item) =>
                normalizeDeptName(item.department) === normalizeDeptName(department)
            )?.questions ?? []
          )
            .map(normaliseQuestion)
            .map((question) => question.name)
        )
      ),
    ],
    [departmentNames]
  );

  // Form validation schema
  const schemaObj = {
    Name: z.string().min(1, "Full name is required"),
    RegistrationNumber: z
      .string()
      .min(1, "Registration number is required")
      .regex(
        /^\d{2}[A-Z]{3}\d{4}$/,
        "Must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)"
      ),
    Email: z.string().email("Valid email required"),
    Phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    Gender: z.string().optional(),
    "Year of Study": z.string().optional(),
    "Why do you want to join Organization Name?": z.string().optional(),
  };

  allQuestionNames.forEach((qd) => {
    schemaObj[qd] = z.string().optional();
  });

  const formSchema = z.object(schemaObj);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      Name: "",
      RegistrationNumber: "",
      Email: user?.email || "",
      Phone: "",
      Gender: "",
      "Year of Study": "1st Year",
      "Why do you want to join Organization Name?": "",
    },
  });

  // Draft loading and synchronization
  useEffect(() => {
    if (!isSignedIn || !user || !draftKey) return;

    const email = user.email;
    let isActive = true;
    setIsDraftReady(false);

    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      form.reset({
        ...form.getValues(),
        ...savedDraft.values,
        Email: email,
      });
      if (savedDraft.savedAt) {
        setLastSavedTime(savedDraft.savedAt);
      }
    } catch {
      form.setValue("Email", email);
    }

    async function initialiseForm() {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      let remoteSubmitted = contextSubmitted || [];

      if (!remoteSubmitted.length) {
        try {
          const response = await fetch(
            `/api/check-applications?email=${encodeURIComponent(email)}`
          );
          const result = await response.json();
          if (result?.submittedDepartments) {
            remoteSubmitted = result.submittedDepartments;
          }
        } catch (err) {
          console.error("Failed to check applications:", err);
        }
      }

      if (!isActive) return;
      const completed = [
        ...new Set([...(savedDraft.submittedDepartments || []), ...remoteSubmitted]),
      ];
      setSubmittedDepartments(completed);

      if (
        departmentNames.length > 0 &&
        departmentNames.every((dept) => completed.includes(dept))
      ) {
        setErrorMessage(
          `You have already submitted an application for ${departmentNames.join(" and ")}.`
        );
      }

      setIsDraftReady(true);
    }

    initialiseForm().catch(() => {
      if (isActive) setIsDraftReady(true);
    });

    return () => {
      isActive = false;
    };
  }, [contextSubmitted, departmentNames, draftKey, form, isSignedIn, user]);

  // Draft saving
  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (!isDraftReady || !draftKey) return;
    const now = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        values: watchedValues,
        submittedDepartments,
        savedAt: now,
      })
    );
    setLastSavedTime(now);
  }, [draftKey, isDraftReady, submittedDepartments, watchedValues]);

  // Step progression with validation
  const handleNext = async () => {
    // Validate fields relevant to the current step
    let isValid = true;
    if (currentStep === 0) {
      isValid = await form.trigger(["Name", "RegistrationNumber", "Email", "Phone"]);
    }

    if (isValid && currentStep < totalSteps - 1) {
      setSlideDirection("forward");
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setSlideDirection("backward");
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Form Submission
  const handleSubmitForm = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");

    const pendingDepartments = departmentNames.filter(
      (department) => !submittedDepartments.includes(department)
    );

    if (!pendingDepartments.length) {
      toast.success("Your applications have already been submitted.");
      setIsSubmitting(false);
      router.push("/status");
      return;
    }

    const basicDetails = {
      Name: values.Name,
      RegistrationNumber: values.RegistrationNumber,
      Email: values.Email,
      Phone: values.Phone,
      Gender: values.Gender || "",
      "Year of Study": values["Year of Study"] || "1st Year",
    };

    const submitDepartment = async (department) => {
      const questions = (
        QuestionnaireData.find((item) => item.department === department)?.questions ??
        []
      ).map(normaliseQuestion);

      const dept1Name = typeof dept1 === "string" ? dept1 : dept1?.name;
      const pref = department === dept1Name ? "1" : "2";

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basicDetails,
          Department: department,
          Pref: pref,
          Questions: questions.reduce(
            (answers, question) => ({
              ...answers,
              [question.name]: values[question.name] || "",
            }),
            {}
          ),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Could not submit ${department}.`);
      }
      return { department, success: true };
    };

    try {
      const results = await Promise.allSettled(
        pendingDepartments.map(submitDepartment)
      );

      const successful = results
        .filter((r) => r.status === "fulfilled" && r.value.success)
        .map((r) => r.value.department);

      const failed = results.flatMap((r, i) =>
        r.status === "rejected" ? [pendingDepartments[i]] : []
      );

      const completed = [...new Set([...submittedDepartments, ...successful])];
      setSubmittedDepartments(completed);
      markDepartmentsSubmitted(completed);

      if (draftKey) {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ values, submittedDepartments: completed })
        );
      }

      if (failed.length) {
        setErrorMessage(
          `Submitted ${successful.join(", ")}. Please retry ${failed.join(", ")}.`
        );
      } else {
        // Prepare ceremonial submission data for Section 8
        const submissionTimestamp = new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        });
        const appCode = `CNCS-${values.RegistrationNumber || "APP"}-${Date.now().toString().slice(-4)}`;

        setSubmissionSuccessData({
          applicantName: values.Name,
          registrationNumber: values.RegistrationNumber,
          email: values.Email,
          departments: successful,
          applicationCode: appCode,
          timestamp: submissionTimestamp,
        });
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage(
        "Application transmission failed. Your saved responses are safe locally. Please retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 8 — CEREMONIAL SUBMISSION SUCCESS SCREEN
  // -------------------------------------------------------------
  if (submissionSuccessData) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-sharp)] bg-[var(--color-success)]/15 text-[var(--color-success)] font-mono text-xs uppercase tracking-widest font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TRANSMISSION CONFIRMED · OFFICIAL PASS ISSUED</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[var(--color-ink)]">
            You're Officially Boarded.
          </h1>
          <p className="font-body text-sm text-[var(--color-ink-muted)] mt-2">
            Your recruitment application has been safely stamped and recorded into the concourse ledger.
          </p>
        </div>

        {/* Ceremonial Ticket-Stub with Ink-Stamp */}
        <div className="relative shadow-[var(--shadow-modal)]">
          <TicketStub
            variant="ceremonial"
            stub={
              <div className="flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="font-mono text-[10px] uppercase text-[var(--color-ink-muted)]">
                    APPLICATION PASS CODE
                  </div>
                  <div className="font-mono text-sm font-bold text-[var(--color-primary)] mt-1">
                    {submissionSuccessData.applicationCode}
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-[var(--color-ink-muted)] uppercase">
                      CANDIDATE REG
                    </div>
                    <div className="font-medium text-[var(--color-ink)]">
                      {submissionSuccessData.registrationNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--color-ink-muted)] uppercase">
                      STAMPED AT
                    </div>
                    <div className="font-medium text-[var(--color-ink)]">
                      {submissionSuccessData.timestamp}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-[var(--color-border)]">
                  <div className="font-mono text-[10px] text-[var(--color-success)] font-semibold uppercase">
                    STATUS · CONFIRMED
                  </div>
                </div>
              </div>
            }
          >
            {/* Signature Tactile Stamp Overlay per designing.md Section 8 */}
            <div className="absolute right-8 top-8 z-30 pointer-events-none select-none">
              <div className="animate-stamp border-4 border-dashed border-[var(--color-stamp)] px-4 py-2 rounded-[var(--radius-sharp)] text-center text-[var(--color-stamp)] bg-transparent">
                <div className="font-mono text-[11px] font-bold tracking-widest uppercase">
                  GDG CONCOURSE 2026
                </div>
                <div className="font-display text-xl font-black uppercase tracking-wider">
                  SUBMITTED
                </div>
                <div className="font-mono text-[9px] tracking-wider">
                  OFFICIAL BOARDING PASS
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="space-y-6 pr-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                  BOARDING RECEIPT
                </span>
                <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-1">
                  {submissionSuccessData.applicantName}
                </h2>
                <p className="font-mono text-xs text-[var(--color-ink-muted)]">
                  {submissionSuccessData.email}
                </p>
              </div>

              <div>
                <div className="font-mono text-xs text-[var(--color-ink-muted)] uppercase mb-2">
                  CONFIRMED DESTINATION GATES
                </div>
                <div className="flex flex-wrap gap-2">
                  {submissionSuccessData.departments.map((dept, i) => (
                    <span
                      key={dept}
                      className="px-3 py-1.5 bg-[var(--color-primary)] text-white font-mono text-xs font-semibold rounded-[var(--radius-sharp)]"
                    >
                      GATE {i + 1}: {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* What Happens Next Mini-Timeline */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <div className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">
                  WHAT HAPPENS NEXT
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2.5 bg-[var(--color-bg)] rounded-[var(--radius-sharp)] border border-[var(--color-border)]">
                    <div className="font-bold text-[var(--color-success)] mb-1">01 · LODGED</div>
                    <div className="text-[11px] text-[var(--color-ink-muted)]">Answers recorded</div>
                  </div>
                  <div className="p-2.5 bg-[var(--color-bg)] rounded-[var(--radius-sharp)] border border-[var(--color-border)]">
                    <div className="font-bold text-[var(--color-warning)] mb-1">02 · REVIEW</div>
                    <div className="text-[11px] text-[var(--color-ink-muted)]">Lead evaluation</div>
                  </div>
                  <div className="p-2.5 bg-[var(--color-bg)] rounded-[var(--radius-sharp)] border border-[var(--color-border)]">
                    <div className="font-bold text-[var(--color-ink-muted)] mb-1">03 · CALL</div>
                    <div className="text-[11px] text-[var(--color-ink-muted)]">Final departure</div>
                  </div>
                </div>
              </div>
            </div>
          </TicketStub>
        </div>

        {/* Action button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push("/status")}
            className="gap-2"
          >
            <span>Proceed to Personal Departure Board</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // APPLICATION PROCESS FORM FLOW
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-3xl mx-auto py-6">
      {/* 1. Boarding-Pass Progress Strip per designing.md Section 6 & 8 */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-4 md:p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="font-mono text-xs uppercase font-semibold text-[var(--color-ink)]">
              BOARDING PROGRESS · PASS {currentStep + 1} OF {totalSteps}
            </span>
          </div>

          {/* Quiet Monospace Autosave Indicator */}
          {lastSavedTime && (
            <div className="font-mono text-xs text-[var(--color-ink-muted)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              <span>Saved · {lastSavedTime}</span>
            </div>
          )}
        </div>

        {/* Segmented Perforated Strip (Desktop) */}
        <div className="hidden md:grid grid-cols-4 gap-2">
          {formSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step.id}
                className={`relative p-2.5 rounded-[var(--radius-sharp)] border transition-all ${
                  isCurrent
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]"
                    : isCompleted
                    ? "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]"
                    : "border-[var(--color-border)] opacity-50 bg-[var(--color-bg)]"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--color-ink-muted)] mb-1">
                  <span>SEGMENT 0{idx + 1}</span>
                  {isCompleted && (
                    <Check className="w-3.5 h-3.5 text-[var(--color-success)] stroke-[3]" />
                  )}
                </div>
                <div className="font-display text-xs font-semibold text-[var(--color-ink)] truncate">
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Progress Indicator */}
        <div className="md:hidden">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5 text-[var(--color-ink)]">
            <span>{formSteps[currentStep].title}</span>
            <span>
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-[var(--radius-sharp)] border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 text-[var(--color-error)] font-body text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* 2. Main Form Form Container with Direction of Travel Transitions */}
      <div
        className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-6 md:p-10 shadow-sm transition-all ${
          slideDirection === "forward" ? "slide-forward" : "slide-backward"
        }`}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)}>
            {/* STEP 0: ABOUT YOU */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                    SECTION 01
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-1">
                    Candidate Particulars
                  </h2>
                  <p className="font-body text-sm text-[var(--color-ink-muted)]">
                    Please provide your authentic academic and contact credentials.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="Name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                          Full Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            hasError={!!fieldState.error}
                            placeholder="e.g. Jane Doe"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="RegistrationNumber"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                          Registration Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            hasError={!!fieldState.error}
                            placeholder="e.g. 25BCE5612"
                            className="uppercase"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                          Verified Email *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            hasError={!!fieldState.error}
                            className="bg-[var(--color-bg)] cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Phone"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                          Phone / WhatsApp (10 digits) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            hasError={!!fieldState.error}
                            placeholder="9876543210"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                          Gender
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            value={field.value || ""}
                            className="flex h-12 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base font-body text-[var(--color-ink)] focus-visible:outline-none focus-visible:border-2 focus-visible:border-[var(--color-primary)]"
                          >
                            <option value="" disabled>
                              Select Gender
                            </option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Year of Study"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                          Year of Study
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            value={field.value || "1st Year"}
                            className="flex h-12 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base font-body text-[var(--color-ink)] focus-visible:outline-none focus-visible:border-2 focus-visible:border-[var(--color-primary)]"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="Why do you want to join Organization Name?"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                        Why do you want to join the club?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Tell us what excites you about the club and community..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 1: DEPARTMENT 1 QUESTIONS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                    SECTION 02 · 1ST CHOICE TRACK
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-1">
                    {departmentNames[0]} Questions
                  </h2>
                  <p className="font-body text-sm text-[var(--color-ink-muted)]">
                    Answer specifically for your primary department preference.
                  </p>
                </div>

                <div className="space-y-5">
                  {getDeptQuestions(departmentNames[0]).map((q) => (
                    <FormField
                      key={q.name}
                      control={form.control}
                      name={q.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                            {q.name}
                          </FormLabel>
                          <FormControl>
                            {q.type === "short-text" ? (
                              <Input {...field} placeholder={q.placeholder || "Your answer..."} />
                            ) : (
                              <Textarea
                                {...field}
                                rows={4}
                                placeholder={q.placeholder || "2-3 sentences..."}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  {getDeptQuestions(departmentNames[0]).length === 0 && (
                    <p className="font-body text-sm text-[var(--color-ink-muted)] italic">
                      No technical questions required for this department. Proceed to the next step.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: DEPARTMENT 2 QUESTIONS (IF SELECTED) */}
            {currentStep === 2 && departmentNames[1] && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                    SECTION 03 · 2ND CHOICE TRACK
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-1">
                    {departmentNames[1]} Questions
                  </h2>
                  <p className="font-body text-sm text-[var(--color-ink-muted)]">
                    Answer specifically for your secondary department preference.
                  </p>
                </div>

                <div className="space-y-5">
                  {getDeptQuestions(departmentNames[1]).map((q) => (
                    <FormField
                      key={q.name}
                      control={form.control}
                      name={q.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-body text-xs font-semibold text-[var(--color-ink)]">
                            {q.name}
                          </FormLabel>
                          <FormControl>
                            {q.type === "short-text" ? (
                              <Input {...field} placeholder={q.placeholder || "Your answer..."} />
                            ) : (
                              <Textarea
                                {...field}
                                rows={4}
                                placeholder={q.placeholder || "2-3 sentences..."}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  {getDeptQuestions(departmentNames[1]).length === 0 && (
                    <p className="font-body text-sm text-[var(--color-ink-muted)] italic">
                      No technical questions required for this department. Proceed to the next step.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* FINAL STEP: BOARDING PASS REVIEW SCREEN */}
            {isReviewStep && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                    FINAL CONFIRMATION
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-1">
                    Review Your Boarding Pass
                  </h2>
                  <p className="font-body text-sm text-[var(--color-ink-muted)]">
                    Please inspect your answers carefully before final submission.
                  </p>
                </div>

                {/* Candidate Overview Card */}
                <div className="p-5 border border-[var(--color-border)] rounded-[var(--radius-sharp)] bg-[var(--color-bg)] space-y-4">
                  <div className="font-mono text-xs font-semibold text-[var(--color-primary)] uppercase">
                    CANDIDATE DOSSIER
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-[var(--color-ink-muted)]">NAME</div>
                      <div className="font-semibold text-[var(--color-ink)] truncate">
                        {form.getValues("Name") || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--color-ink-muted)]">REG NUMBER</div>
                      <div className="font-semibold text-[var(--color-ink)]">
                        {form.getValues("RegistrationNumber") || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--color-ink-muted)]">PHONE</div>
                      <div className="font-semibold text-[var(--color-ink)]">
                        {form.getValues("Phone") || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--color-ink-muted)]">YEAR</div>
                      <div className="font-semibold text-[var(--color-ink)]">
                        {form.getValues("Year of Study") || "1st Year"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination Tracks Summary */}
                <div className="space-y-4">
                  <div className="font-mono text-xs uppercase font-semibold text-[var(--color-ink-muted)]">
                    DESTINATION CHOICES
                  </div>
                  <div className="p-4 border border-[var(--color-border)] rounded-[var(--radius-sharp)] bg-[var(--color-surface)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[var(--color-primary)] text-white text-[10px] font-mono font-bold rounded">
                        1ST CHOICE
                      </span>
                      <span className="font-display font-semibold text-base text-[var(--color-ink)]">
                        {departmentNames[0]}
                      </span>
                    </div>
                    <div className="space-y-2 mt-3 pt-3 border-t border-[var(--color-border)] text-xs">
                      {getDeptQuestions(departmentNames[0]).map((q) => (
                        <div key={q.name}>
                          <div className="text-[var(--color-ink-muted)] font-medium">
                            {q.name}
                          </div>
                          <div className="text-[var(--color-ink)] mt-0.5 whitespace-pre-wrap">
                            {form.getValues(q.name) || (
                              <span className="italic opacity-50">Not answered</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {departmentNames[1] && (
                    <div className="p-4 border border-[var(--color-border)] rounded-[var(--radius-sharp)] bg-[var(--color-surface)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[var(--color-accent)] text-[var(--color-ink)] text-[10px] font-mono font-bold rounded">
                          2ND CHOICE
                        </span>
                        <span className="font-display font-semibold text-base text-[var(--color-ink)]">
                          {departmentNames[1]}
                        </span>
                      </div>
                      <div className="space-y-2 mt-3 pt-3 border-t border-[var(--color-border)] text-xs">
                        {getDeptQuestions(departmentNames[1]).map((q) => (
                          <div key={q.name}>
                            <div className="text-[var(--color-ink-muted)] font-medium">
                              {q.name}
                            </div>
                            <div className="text-[var(--color-ink)] mt-0.5 whitespace-pre-wrap">
                              {form.getValues(q.name) || (
                                <span className="italic opacity-50">Not answered</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation & Submission Controls */}
            <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrev}
                  className="gap-2"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/departments")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}

              {!isReviewStep ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="gap-2 bg-[var(--color-primary)] px-8"
                >
                  <span>Confirm &amp; Board Application</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
