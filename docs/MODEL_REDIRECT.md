# Model Redirect

Model Redirect maps an incoming model name to another model name or combo.

Default public redirect:

```text
gpt-5.4-mini -> helper.fallback
```

Create the `helper.fallback` combo yourself:

1. Add a provider in the dashboard.
2. Create a combo named `helper.fallback`.
3. Add a cheap helper model to the combo.
4. Open `Dashboard -> Profile -> Model Redirect`.
5. Ensure helper models point to `helper.fallback`.

Use neutral public names. Avoid personal or private combo names.
