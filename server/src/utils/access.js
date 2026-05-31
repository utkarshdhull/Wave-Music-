export function canManageResource(user, ownerId) {
  return user.role === "admin" || String(user._id) === String(ownerId);
}

