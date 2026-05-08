import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Smartphone, Truck } from "lucide-react";
import { getStoreSettings, updateStoreSettings } from "../../Api";

const buildInitialForm = () => ({
  hungzo: {
    termsOfServiceUrl: "",
    privacyPolicyUrl: "",
  },
  deliveryPartner: {
    termsOfServiceUrl: "",
    privacyPolicyUrl: "",
  },
});

const APP_SECTIONS = [
  {
    key: "hungzo",
    title: "Hungzo",
    description:
      "Configure the legal links shown on the customer app login experience.",
    icon: Smartphone,
  },
  {
    key: "deliveryPartner",
    title: "Hungzo Delivery Partner",
    description:
      "Configure the legal links reserved for the delivery partner app experience.",
    icon: Truck,
  },
];

const isValidOptionalUrl = (value) => {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_error) {
    return false;
  }
};

export default function AppConfiguration() {
  const [form, setForm] = useState(buildInitialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const response = await getStoreSettings();

    if (!response?.success) {
      toast.error(response?.message || "Failed to fetch app configuration");
      setLoading(false);
      return;
    }

    setForm({
      ...buildInitialForm(),
      ...(response.settings?.appConfiguration || {}),
    });
    setLoading(false);
  }

  function updateField(appKey, field, value) {
    setForm((current) => ({
      ...current,
      [appKey]: {
        ...current[appKey],
        [field]: value,
      },
    }));
  }

  function validateForm() {
    for (const section of APP_SECTIONS) {
      const values = form[section.key] || {};
      if (!isValidOptionalUrl(values.termsOfServiceUrl || "")) {
        return `${section.title} Terms of Service URL must be a valid http or https link`;
      }
      if (!isValidOptionalUrl(values.privacyPolicyUrl || "")) {
        return `${section.title} Privacy Policy URL must be a valid http or https link`;
      }
    }
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setSaving(true);
    const payload = {
      appConfiguration: {
        hungzo: {
          termsOfServiceUrl: form.hungzo.termsOfServiceUrl.trim(),
          privacyPolicyUrl: form.hungzo.privacyPolicyUrl.trim(),
        },
        deliveryPartner: {
          termsOfServiceUrl: form.deliveryPartner.termsOfServiceUrl.trim(),
          privacyPolicyUrl: form.deliveryPartner.privacyPolicyUrl.trim(),
        },
      },
    };

    const response = await updateStoreSettings(payload);

    if (!response?.success) {
      toast.error(response?.message || "Failed to update app configuration");
      setSaving(false);
      return;
    }

    setForm({
      ...buildInitialForm(),
      ...(response.settings?.appConfiguration || payload.appConfiguration),
    });
    toast.success("App configuration updated");
    setSaving(false);
  }

  const fieldClassName =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

  return (
    <div className="min-h-full bg-slate-50 px-6 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200">
                Login Experience
              </p>
              <h1 className="mt-2 text-3xl font-semibold">App Configuration</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Manage customer-facing legal links for Hungzo and Hungzo Delivery Partner separately.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50">
              These links appear on login consent text
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          {APP_SECTIONS.map((section) => {
            const Icon = section.icon;
            const values = form[section.key] || buildInitialForm()[section.key];

            return (
              <section
                key={section.key}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    Terms of Service URL
                    <input
                      value={values.termsOfServiceUrl || ""}
                      onChange={(event) =>
                        updateField(
                          section.key,
                          "termsOfServiceUrl",
                          event.target.value
                        )
                      }
                      className={fieldClassName}
                      placeholder="https://example.com/terms"
                      disabled={loading || saving}
                    />
                  </label>

                  <label className="text-sm font-medium text-slate-700">
                    Privacy Policy URL
                    <input
                      value={values.privacyPolicyUrl || ""}
                      onChange={(event) =>
                        updateField(
                          section.key,
                          "privacyPolicyUrl",
                          event.target.value
                        )
                      }
                      className={fieldClassName}
                      placeholder="https://example.com/privacy"
                      disabled={loading || saving}
                    />
                  </label>
                </div>
              </section>
            );
          })}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading || saving}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reload
            </button>
            <button
              type="submit"
              disabled={loading || saving}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save App Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
