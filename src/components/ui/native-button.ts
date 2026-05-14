import * as React from "react"

function getNativeButtonProp(
  render: unknown,
  nativeButton: boolean | undefined
) {
  if (nativeButton !== undefined || render == null) {
    return nativeButton
  }

  return React.isValidElement(render) && render.type === "button"
}

export { getNativeButtonProp }
