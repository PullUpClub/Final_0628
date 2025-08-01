import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { Button } from "../../components/ui/Button";
import { LoadingState, ErrorState } from "../../components/ui/LoadingState";
import { Download, DollarSign, Users, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useTranslation } from 'react-i18next';
import Head from "../../components/Layout/Head";
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const LOGO_PATH = "/PUClogo-optimized.webp";

const AdminPayoutsPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [availableMonths, setAvailableMonths] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    readyToPay: 0,
    needsSetup: 0,
    totalAmount: 0,
    readyAmount: 0
  });

  const fetchAvailableMonths = async () => {
    try {
      const { data, error } = await supabase.rpc('get_payout_months');
      if (error) throw error;
      
      setAvailableMonths(data || []);
      
      if (data && data.length > 0) {
        const currentMonthExists = data.some(m => m.month_value === selectedMonth);
        if (!currentMonthExists) {
          setSelectedMonth(data[0].month_value);
        }
      }
    } catch (error) {
      console.error('Error fetching available months:', error);
    }
  };

  const fetchPayouts = async (month) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_payouts_by_month', {
        target_month: month
      });

      if (error) throw error;

      setPayouts(data || []);

      const readyToPay = data?.filter(p => p.payout_paypal_email || p.user_paypal_email) || [];
      const needsSetup = data?.filter(p => !p.payout_paypal_email && !p.user_paypal_email) || [];
      
      setSummary({
        total: data?.length || 0,
        readyToPay: readyToPay.length,
        needsSetup: needsSetup.length,
        totalAmount: data?.reduce((sum, p) => sum + parseFloat(p.amount_dollars || 0), 0) || 0,
        readyAmount: readyToPay.reduce((sum, p) => sum + parseFloat(p.amount_dollars || 0), 0)
      });

    } catch (error) {
      console.error('Error fetching payouts:', error);
      setPayouts([]);
      setSummary({ total: 0, readyToPay: 0, needsSetup: 0, totalAmount: 0, readyAmount: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchPayouts(selectedMonth);
    }
  }, [selectedMonth]);

  const downloadCSV = () => {
    if (payouts.length === 0) {
      toast.error('No payouts to export');
      return;
    }

    const headers = ['Name', 'Email', 'PayPal Email', 'Amount', 'Status', 'Request Date', 'Payment Instructions'];
    const csvRows = [
      headers.join(','),
      ...payouts.map(payout => {
        const paypalEmail = payout.payout_paypal_email || payout.user_paypal_email;
        const instructions = paypalEmail 
          ? `Send $${payout.amount_dollars} to ${paypalEmail}`
          : `User needs to add PayPal email first`;
        
        return [
          `"${payout.full_name || 'Unknown'}"`,
          `"${payout.email || 'No email'}"`,
          `"${paypalEmail || 'NO PAYPAL SETUP'}"`,
          `$${payout.amount_dollars}`,
          paypalEmail ? 'Ready to Pay' : 'Needs PayPal Setup',
          new Date(payout.request_date).toLocaleDateString(),
          `"${instructions}"`
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pull-up-club-payouts-${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`✅ Downloaded ${payouts.length} payouts for ${selectedMonth}`);
  };

  const sendPayPalReminders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-paypal-reminders', {
        body: { target_month: selectedMonth }
      });

      if (error) throw error;
      toast.success(`✅ Sent ${data.emails_sent} PayPal reminder emails`);
      
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error('Failed to send PayPal reminders');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Admin Payouts - Pull-Up Club</title>
        <meta name="description" content="Manage monthly payouts and payment processing" />
      </Head>
      <div className="min-h-screen bg-black py-8 px-2 md:px-8">
        {/* Email notification banner */}
        <div className="bg-[#918f6f]/10 border border-[#918f6f] text-white p-4 rounded-lg mb-6">
          <p className="text-sm">
            📧 <strong className="text-[#918f6f]">Monthly Payout System Active:</strong> PayPal reminder emails are automatically sent to users who need to set up their PayPal email. Users can add their PayPal email in their profile settings.
            <br />
            <span className="text-[#918f6f]/80">Make sure the send-paypal-reminders Edge Function is deployed and configured.</span>
          </p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-1 items-center justify-center">
            <img 
              src={LOGO_PATH} 
              alt="Pull-Up Club Logo" 
              className="h-12 w-auto object-contain mr-4" 
              onError={(e) => {
                console.log('Logo failed to load, trying PNG fallback');
                e.currentTarget.src = "/PUClogo.png";
              }}
            />
            <h1 className="text-2xl md:text-3xl font-bold text-[#918f6f] tracking-wide text-center">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Toggle Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#18181b] rounded-lg border border-[#23231f] p-1">
            <Link
              to="/admin-dashboard"
              className="px-6 py-2 rounded-md text-[#9a9871] hover:text-[#ededed] transition-colors"
            >
              Submission Center
            </Link>
            <span className="px-6 py-2 rounded-md bg-[#9b9b6f] text-black font-semibold">
              Monthly Payouts
            </span>
          </div>
        </div>

        {/* Monthly Payouts Section */}
        <div className="bg-[#18181b] rounded-lg border border-[#23231f] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-[#23231f]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <DollarSign className="text-[#9b9b6f]" size={24} />
                <div>
                  <h2 className="text-xl font-semibold text-[#ededed]">Monthly Payouts</h2>
                  <p className="text-[#9a9871] text-sm">
                    {summary.total} total • {summary.readyToPay} ready • ${summary.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Month Selector */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#23231f] border border-[#23231f] rounded px-3 py-2 text-[#ededed] text-sm"
                >
                  {availableMonths.map(month => (
                    <option key={month.month_value} value={month.month_value}>
                      {month.month_label} ({month.payout_count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#23231f] p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="text-[#9b9b6f]" size={20} />
                  <div>
                    <p className="text-[#9a9871] text-xs">Total Pending</p>
                    <p className="text-lg font-bold text-[#ededed]">{summary.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#23231f] p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={20} />
                  <div>
                    <p className="text-[#9a9871] text-xs">Ready to Pay</p>
                    <p className="text-lg font-bold text-green-400">{summary.readyToPay}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#23231f] p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-400" size={20} />
                  <div>
                    <p className="text-[#9a9871] text-xs">Needs PayPal</p>
                    <p className="text-lg font-bold text-yellow-400">{summary.needsSetup}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#23231f] p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-[#9b9b6f]" size={20} />
                  <div>
                    <p className="text-[#9a9871] text-xs">Total Amount</p>
                    <p className="text-lg font-bold text-[#ededed]">${summary.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                disabled={payouts.length === 0}
                className="bg-[#9b9b6f] hover:bg-[#a5a575] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Download CSV ({payouts.length})
              </button>

              {summary.needsSetup > 0 && (
                <button
                  onClick={sendPayPalReminders}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Send Reminders ({summary.needsSetup})
                </button>
              )}
            </div>

            {/* Payout Table - Full List */}
            {isLoading ? (
              <LoadingState message="Loading payouts..." />
            ) : payouts.length === 0 ? (
              <div className="text-center text-[#9a9871] py-8">
                <p className="text-lg">No pending payouts for {selectedMonth}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#23231f]">
                    <tr>
                      <th className="text-left p-3 font-medium text-[#ededed]">Name</th>
                      <th className="text-left p-3 font-medium text-[#ededed]">PayPal Email</th>
                      <th className="text-left p-3 font-medium text-[#ededed]">Amount</th>
                      <th className="text-left p-3 font-medium text-[#ededed]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => {
                      const paypalEmail = payout.payout_paypal_email || payout.user_paypal_email;
                      const isReady = !!paypalEmail;
                      
                      return (
                        <tr 
                          key={payout.payout_id} 
                          className={`border-b border-[#23231f] ${isReady ? 'bg-green-900/10' : 'bg-yellow-900/10'}`}
                        >
                          <td className="p-3 text-[#ededed]">{payout.full_name || 'Unknown'}</td>
                          <td className="p-3">
                            {paypalEmail ? (
                              <span className="text-green-400 text-xs">{paypalEmail}</span>
                            ) : (
                              <span className="text-yellow-400 text-xs">No PayPal Setup</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-[#ededed]">${payout.amount_dollars}</td>
                          <td className="p-3">
                            {isReady ? (
                              <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs">
                                Ready
                              </span>
                            ) : (
                              <span className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded text-xs">
                                Setup Needed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                <div className="p-3 text-center text-[#9a9871] text-sm">
                  Showing all {payouts.length} payouts for {selectedMonth}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPayoutsPage; 