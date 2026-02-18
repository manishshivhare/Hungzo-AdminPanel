import React, { useState, useEffect } from 'react';
import { WalletList } from '../../Api';
import { useNavigate } from 'react-router-dom'; // Add this
import {
  Wallet,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Copy,
  Eye
} from 'lucide-react';

const WalletsDetails = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('balance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  
  const navigate = useNavigate(); // Initialize navigation

  // Fetch wallets data
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        const result = await WalletList();

        if (result.success && Array.isArray(result.wallets)) {
          setWallets(result.wallets);
        } else if (Array.isArray(result)) {
          setWallets(result);
        } else if (result.data && Array.isArray(result.data.wallets)) {
          setWallets(result.data.wallets);
        } else {
          setError('Invalid data format received');
        }
      } catch (err) {
        setError('Failed to load wallets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
    return { totalBalance };
  };

  const { totalBalance } = calculateTotals();

  // Filter and sort wallets
  const filteredAndSortedWallets = React.useMemo(() => {
    let filtered = wallets.filter(wallet => {
      const searchLower = searchTerm.toLowerCase();
      return (
        wallet.user?.phone?.toLowerCase().includes(searchLower) ||
        wallet.user?.email?.toLowerCase().includes(searchLower) ||
        wallet._id?.toLowerCase().includes(searchLower)
      );
    });

    // Sort wallets
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'balance':
          aValue = a.balance || 0;
          bValue = b.balance || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'phone':
          aValue = a.user?.phone || '';
          bValue = b.user?.phone || '';
          break;
        default:
          aValue = a.balance || 0;
          bValue = b.balance || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [wallets, searchTerm, sortBy, sortOrder]);

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await WalletList();
      if (result.success && Array.isArray(result.wallets)) {
        setWallets(result.wallets);
      }
    } catch (err) {
      setError('Failed to refresh wallets');
    } finally {
      setLoading(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text);
      setShowCopyNotification(true);
      setTimeout(() => {
        setShowCopyNotification(false);
        setCopiedId('');
      }, 2000);
    })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Handle view transactions - Fixed navigation
  const handleViewTransactions = (walletId) => {
    navigate(`/wallet/${walletId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-gray-800">Error Loading Wallets</p>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied to clipboard!</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-blue-600" />
                Wallet Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and monitor user wallet balances</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-6 mt-1">
            <div className="bg-white rounded-xl shadow-sm p-2 px-2 border border-gray-100">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-600">Total Wallets</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{wallets.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-2 border border-gray-100">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-1 mb-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by phone, email, or wallet ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="balance">Sort by Balance</option>
                  <option value="date">Sort by Date</option>
                  <option value="phone">Sort by Phone</option>
                </select>
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? 'Asc ↑' : 'Desc ↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Wallets Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-y-auto h-[55vh]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Balance
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet ID
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedWallets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-lg">No wallets found</p>
                        <p className="text-sm mt-1">
                          {searchTerm ? 'Try a different search term' : 'No wallets available'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedWallets.map((wallet) => (
                    <tr
                      key={wallet._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {wallet.user?.phone?.slice(-2) || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {wallet.user?.phone || 'N/A'}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(wallet.user?.phone || '');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy phone"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {wallet.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-bold ${(wallet.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(wallet.balance)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last updated: {formatDate(wallet.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(wallet.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Wallet ID: {wallet._id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                            {wallet._id?.substring(0, 12)}...
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(wallet._id || '');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy wallet ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedWallet(wallet)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600">
          Showing {filteredAndSortedWallets.length} of {wallets.length} wallets
        </div>
      </div>

      {/* Wallet Details Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Wallet Details</h2>
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">User Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Phone Number</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">{selectedWallet.user?.phone}</span>
                        <button
                          onClick={() => handleCopy(selectedWallet.user?.phone || '')}
                          className="text-gray-400 hover:text-gray-600 ml-auto"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{selectedWallet.user?.email || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">User ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded truncate flex-1">
                          {selectedWallet.user?._id}
                        </code>
                        <button
                          onClick={() => handleCopy(selectedWallet.user?._id || '')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Wallet Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Current Balance</label>
                      <div className={`text-2xl font-bold mt-1 ${(selectedWallet.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedWallet.balance)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Wallet ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded truncate flex-1">
                          {selectedWallet._id}
                        </code>
                        <button
                          onClick={() => handleCopy(selectedWallet._id || '')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleViewTransactions(selectedWallet.user?._id);
                    setSelectedWallet(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!selectedWallet.user?._id}
                >
                  View Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletsDetails;