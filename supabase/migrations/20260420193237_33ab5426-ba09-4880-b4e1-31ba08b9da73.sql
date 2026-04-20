DROP POLICY "Hotel images are publicly accessible" ON storage.objects;

CREATE POLICY "Admins can list hotel images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'hotel-images' AND public.has_role(auth.uid(), 'admin'));