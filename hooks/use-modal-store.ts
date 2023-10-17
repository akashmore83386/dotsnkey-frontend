import { create } from "zustand";

export type ModalType = "createUser" | "removeUser";

interface CreateUser {
  FullName: string;
  Email: string;
  Password: string;
  CountryId: string;
  StateId: string;
  CityId: string;
  LanguageIds: string[];
  isActive: boolean;
}

interface ModalData {
  createuser?: CreateUser;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));