interface MyPopoverProps {
  xoffset?: number
  yoffset?: number
  $?: (self: any) => void
  [key: string]: any
}

export function MyPopover({
  xoffset = 0,
  yoffset = 0,
  ...props
}: MyPopoverProps) {
  return (
    <popover
      {...props}
      $={(self) => {
        self.set_offset(xoffset, yoffset)
        props.$?.(self)
      }}
    />
  )
}
