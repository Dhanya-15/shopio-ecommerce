import { toast } from '../toast.js';

export const useToast = () => toast;
export const ToastProvider = ({ children }) => children;
