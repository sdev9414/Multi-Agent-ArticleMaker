// Join truthy class fragments. No clsx dependency needed for this.
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
