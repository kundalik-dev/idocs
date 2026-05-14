import * as React from "react"

function getNativeButtonProp(
  render: unknown,
  nativeButton: boolean | undefined
) {
  if (nativeButton !== undefined || render == null) {
    return nativeButton
  }

  if (React.isValidElement(render) && typeof render.type === "string") {
    return render.type === "button"
  }

  return undefined
}

export { getNativeButtonProp }
