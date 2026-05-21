--[[
  Quarto shortcode: {{< colab-btn href="..." [label="..."] >}}

  Emits the dragon-theme "Run me" CTA. Markup parity with
  blog/assets/dragon_theme/partials/_colab-btn.scss; the back-card
  network is built lazily by colab-btn.js on first hover.
--]]

local function escape_html(s)
  if s == nil then return "" end
  return (tostring(s)
    :gsub("&", "&amp;")
    :gsub("<", "&lt;")
    :gsub(">", "&gt;")
    :gsub('"', "&quot;")
    :gsub("'", "&#39;"))
end

local function arg(kwargs, name, default)
  local v = kwargs[name]
  if v == nil then return default end
  local s = pandoc.utils.stringify(v)
  if s == "" then return default end
  return s
end

return {
  ["colab-btn"] = function(args, kwargs, meta)
    local href = arg(kwargs, "href", "")
    local label = arg(kwargs, "label", "Open in Colab")

    if href == "" then
      return pandoc.RawInline("html", "<!-- colab-btn: missing href= -->")
    end

    local html = string.format([[
<a class="oc-colab-btn" href="%s" target="_blank" rel="noopener">
  <span class="oc-colab-btn-back" aria-hidden="true">
    <span class="oc-colab-btn-back-eyebrow">forward pass &#x2192;</span>
    <svg class="oc-colab-btn-net" viewBox="0 0 230 76" aria-hidden="true"></svg>
  </span>
  <span class="oc-colab-btn-front">
    <svg class="oc-colab-btn-glyph" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="11" cy="16" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="21" cy="16" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="16" cy="16" r="2.6" fill="currentColor"/>
      <polygon points="14.5,13.4 14.5,18.6 19,16" fill="var(--bg-raised)"/>
    </svg>
    <span class="oc-colab-btn-text">
      <span class="oc-colab-btn-front-eyebrow">interactive notebook</span>
      <span class="oc-colab-btn-title">%s</span>
    </span>
    <span class="oc-colab-btn-arrow">&#x2197;</span>
  </span>
</a>]], escape_html(href), escape_html(label))

    return pandoc.RawBlock("html", html)
  end
}
