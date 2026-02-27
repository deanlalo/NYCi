import { useState, useCallback } from 'react';
import { getPrices, updatePrice } from '../utils/prices';
import {
  loadCompanyInfo,
  saveCompanyInfo,
  loadHeader,
  saveHeader,
  removeHeader as removeHeaderStorage,
} from '../utils/storage';

/* Hardcoded PIN — replace with real auth in production */
const ADMIN_PIN = '1234';

export function useAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [prices, setPrices] = useState(getPrices);
  const [companyInfo, setCompanyInfo] = useState(loadCompanyInfo);
  const [headerImage, setHeaderImage] = useState(loadHeader);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsUnlocked(false);
  }, []);

  const verifyPin = useCallback((pin) => {
    if (pin === ADMIN_PIN) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  }, []);

  const handleUpdatePrice = useCallback((item, price) => {
    const updated = updatePrice(item, price);
    setPrices({ ...updated });
  }, []);

  const handleUpdateCompanyInfo = useCallback((updates) => {
    setCompanyInfo((prev) => {
      const next = { ...prev, ...updates };
      saveCompanyInfo(next);
      return next;
    });
  }, []);

  const handleUploadHeader = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      saveHeader(base64);
      setHeaderImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveHeader = useCallback(() => {
    removeHeaderStorage();
    setHeaderImage(null);
  }, []);

  return {
    isOpen,
    isUnlocked,
    prices,
    headerImage,
    open,
    close,
    verifyPin,
    updatePrice: handleUpdatePrice,
    companyInfo,
    updateCompanyInfo: handleUpdateCompanyInfo,
    uploadHeader: handleUploadHeader,
    removeHeader: handleRemoveHeader,
  };
}
