# Patch Order

Thu tu apply patch — phai dung thu tu nay, giong Docker build.

## 1. Main Patch

```
git apply patches/routerdone-custom.patch
```

Patch chinh: rebrand + tuy chinh dashboard, CLI tools, config, MITM,
layout, manifest, public page, Sidebar, Header, settings.

## 2. Feature Patches (alphabetical, z-prefix = apply sau)

| # | File | Chuc nang |
|---|------|-----------|
| 1 | `console-log-retention.patch` | Gioi han + prune console log |
| 2 | `force-stream-fix.patch` | Fix force-stream cho combo |
| 3 | `provider-auto-heal.patch` | Auto-heal provider khi loi |
| 4 | `quota-auto-manage.patch` | Auto-manage quota |
| 5 | `z-adaptive-timeout-v2.patch` | Adaptive timeout v2 |
| 6 | `zz-runtime-observability.patch` | Runtime observability |
| 7 | `zzz-scored-rtk.patch` | Scored RTK filter + dedup |
| 8 | `zzza-progressive-rtk.patch` | Progressive RTK tiering (phu thuoc #7) |
| 9 | `zzzzb-quota-default-provider.patch` | Default provider filter trong Quota |
| 10 | `zzzzc-stream-error-fallback.patch` | Combo fallback khi SSE error |
| 11 | `zzzzd-redirect-gpt54mini-to-combo.patch` | Redirect gpt-5.4-mini -> helper.fallback |
| 12 | `zzzze-model-redirect-ui.patch` | Model Redirect UI card (Profile) |
| 13 | `zzzzf-sanitize-tool-call-arguments.patch` | Sanitize tool call args |
| 14 | `zzzzg-normalize-output-text-content.patch` | Normalize output_text content |
| 15 | `zzzzh-gmt7-console-timestamps.patch` | GMT+7 console timestamps |
| 16 | `zzzzi-compatible-custom-model-selector.patch` | Compatible custom model selector |

## Luu y thu tu

- `zzza-progressive-rtk.patch` phai apply SAU `zzz-scored-rtk.patch`
  (progressive phu thuoc scored).
- PowerShell `Sort-Object Name` co the sap xep `zzza` truoc `zzz-`
  (khac ASCII). Luon apply `zzz-scored-rtk` truoc `zzza-progressive-rtk`.

## Rebase History

| Ngay | Upstream | Patch rebase | Ghi chu |
|------|----------|--------------|---------|
| 2026-06-24 | v0.5.8 | All patches | Khoi tao RouterDone public export |
