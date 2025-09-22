'use client';

import { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

export interface AddressData {
  postcode: string;        // 우편번호
  address: string;         // 기본주소 (도로명주소 또는 지번주소)
  detailAddress: string;   // 상세주소
  fullAddress: string;     // 전체주소
}

interface AddressSearchProps {
  onAddressSelect: (address: AddressData) => void;
  initialAddress?: AddressData;
  disabled?: boolean;
}

export function AddressSearch({ onAddressSelect, initialAddress, disabled }: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailAddress, setDetailAddress] = useState(initialAddress?.detailAddress || '');
  const [selectedAddress, setSelectedAddress] = useState<Omit<AddressData, 'detailAddress' | 'fullAddress'> | null>(
    initialAddress ? { postcode: initialAddress.postcode, address: initialAddress.address } : null
  );

  const handleComplete = (data: {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
    zonecode: string;
  }) => {
    let fullAddress = data.address;
    let extraAddress = '';

    // 도로명주소인 경우 추가 주소 정보 처리
    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '');
    }

    const addressData = {
      postcode: data.zonecode,
      address: fullAddress,
    };

    setSelectedAddress(addressData);
    setIsOpen(false);

    // 상세주소와 함께 전체 주소 정보 전달
    const completeAddress: AddressData = {
      ...addressData,
      detailAddress,
      fullAddress: `${fullAddress} ${detailAddress}`.trim(),
    };

    onAddressSelect(completeAddress);
  };

  const handleDetailAddressChange = (value: string) => {
    setDetailAddress(value);

    if (selectedAddress) {
      const completeAddress: AddressData = {
        ...selectedAddress,
        detailAddress: value,
        fullAddress: `${selectedAddress.address} ${value}`.trim(),
      };
      onAddressSelect(completeAddress);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address">
        주소 <span className="text-red-500">*</span>
      </Label>

      {/* 우편번호 및 기본주소 */}
      <div className="flex gap-2">
        <Input
          id="postcode"
          type="text"
          placeholder="우편번호"
          value={selectedAddress?.postcode || ''}
          readOnly
          className="flex-1"
          disabled={disabled}
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="shrink-0"
            >
              <MapPin className="h-4 w-4 mr-2" />
              주소 찾기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>주소 검색</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <DaumPostcode
                onComplete={handleComplete}
                style={{
                  width: '100%',
                  height: '400px',
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 기본주소 */}
      <Input
        id="address"
        type="text"
        placeholder="기본주소"
        value={selectedAddress?.address || ''}
        readOnly
        disabled={disabled}
      />

      {/* 상세주소 */}
      <Input
        id="detailAddress"
        type="text"
        placeholder="상세주소를 입력하세요 (동/호수 등)"
        value={detailAddress}
        onChange={(e) => handleDetailAddressChange(e.target.value)}
        disabled={disabled || !selectedAddress}
      />

      {selectedAddress && (
        <div className="text-xs text-gray-500">
          전체주소: {selectedAddress.address} {detailAddress}
        </div>
      )}
    </div>
  );
}