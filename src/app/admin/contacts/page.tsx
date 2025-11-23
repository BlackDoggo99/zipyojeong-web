'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Phone, Building2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  adminEmailId?: string;
  userEmailId?: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Firestore에서 문의 실시간 조회
    const q = query(
      collection(firestore, 'contacts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const contactsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Contact[];
        setContacts(contactsData);
        setLoading(false);
      },
      (error) => {
        console.error('문의 조회 오류:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, router]);

  const updateContactStatus = async (contactId: string, newStatus: Contact['status']) => {
    try {
      await updateDoc(doc(firestore, 'contacts', contactId), {
        status: newStatus,
      });
    } catch (error) {
      console.error('상태 업데이트 오류:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: Contact['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">대기중</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">처리중</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">완료</Badge>;
    }
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusCounts = () => {
    return {
      pending: contacts.filter(c => c.status === 'pending').length,
      in_progress: contacts.filter(c => c.status === 'in_progress').length,
      completed: contacts.filter(c => c.status === 'completed').length,
      total: contacts.length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">문의 관리</h1>
        <p className="text-gray-600">고객 문의를 확인하고 관리할 수 있습니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 문의</CardDescription>
            <CardTitle className="text-2xl">{counts.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              대기중
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{counts.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              처리중
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">{counts.in_progress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              완료
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{counts.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 문의 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">문의 목록</h2>
          {contacts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                문의 내역이 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <Card
                  key={contact.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedContact?.id === contact.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(contact.createdAt)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(contact.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                      )}
                      <div className="mt-2">
                        <Badge variant="secondary">{contact.inquiryType}</Badge>
                      </div>
                      <p className="text-gray-500 mt-2 line-clamp-2">{contact.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 상세 정보 */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedContact ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>문의 상세</CardTitle>
                    <CardDescription className="mt-1">
                      {formatDate(selectedContact.createdAt)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(selectedContact.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 문의자 정보 */}
                <div>
                  <h3 className="font-semibold mb-3">문의자 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-20">이름:</span>
                      <span>{selectedContact.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium w-16">이메일:</span>
                      <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                        {selectedContact.email}
                      </a>
                    </div>
                    {selectedContact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium w-16">전화:</span>
                        <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                          {selectedContact.phone}
                        </a>
                      </div>
                    )}
                    {selectedContact.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium w-16">회사:</span>
                        <span>{selectedContact.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-20">문의 유형:</span>
                      <Badge variant="secondary">{selectedContact.inquiryType}</Badge>
                    </div>
                  </div>
                </div>

                {/* 문의 내용 */}
                <div>
                  <h3 className="font-semibold mb-3">문의 내용</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                {/* 상태 변경 버튼 */}
                <div>
                  <h3 className="font-semibold mb-3">상태 변경</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedContact.status === 'pending' ? 'default' : 'outline'}
                      onClick={() => updateContactStatus(selectedContact.id, 'pending')}
                      disabled={selectedContact.status === 'pending'}
                    >
                      대기중
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedContact.status === 'in_progress' ? 'default' : 'outline'}
                      onClick={() => updateContactStatus(selectedContact.id, 'in_progress')}
                      disabled={selectedContact.status === 'in_progress'}
                    >
                      처리중
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedContact.status === 'completed' ? 'default' : 'outline'}
                      onClick={() => updateContactStatus(selectedContact.id, 'completed')}
                      disabled={selectedContact.status === 'completed'}
                    >
                      완료
                    </Button>
                  </div>
                </div>

                {/* 이메일 ID */}
                {(selectedContact.adminEmailId || selectedContact.userEmailId) && (
                  <div className="pt-4 border-t text-xs text-gray-500">
                    {selectedContact.adminEmailId && (
                      <div>관리자 이메일 ID: {selectedContact.adminEmailId}</div>
                    )}
                    {selectedContact.userEmailId && (
                      <div>사용자 이메일 ID: {selectedContact.userEmailId}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                문의를 선택해주세요
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
