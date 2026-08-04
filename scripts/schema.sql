-- 1. Enable RLS on core tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discrepancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vendors"
  ON public.vendors FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Supervisors and admins can manage vendors"
  ON public.vendors FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Authenticated users can view shipments"
  ON public.shipments FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Receivers, supervisors, and admins can update shipments"
  ON public.shipments FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('receiver', 'supervisor', 'admin')
    )
  );

CREATE POLICY "Authenticated users can view discrepancies"
  ON public.discrepancies FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Receivers can log discrepancies"
  ON public.discrepancies FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('receiver', 'supervisor', 'admin')
    )
  );