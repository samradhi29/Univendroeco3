import { AdminLayout } from "@/components/admin-layout";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Database, Shield } from "lucide-react";

export default function FileManager() {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AWS S3 File Manager</h1>
          <p className="text-gray-600 mt-2">Upload and manage files using Amazon S3 cloud storage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Cloud className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">Cloud Storage</h3>
              <p className="text-sm text-gray-600">Files stored securely in AWS S3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">Secure Access</h3>
              <p className="text-sm text-gray-600">Authenticated uploads with access control</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="font-semibold mb-2">Scalable</h3>
              <p className="text-sm text-gray-600">Unlimited storage capacity</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList>
            <TabsTrigger value="single">Single File Upload</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Files Upload</TabsTrigger>
            <TabsTrigger value="documents">Document Upload</TabsTrigger>
            <TabsTrigger value="images">Image Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Single File Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  folder="single-uploads"
                  multiple={false}
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onUpload={(files) => {
                    console.log('Uploaded files:', files);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiple">
            <Card>
              <CardHeader>
                <CardTitle>Multiple Files Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  folder="batch-uploads"
                  multiple={true}
                  accept="image/*,application/pdf"
                  onUpload={(files) => {
                    console.log('Uploaded files:', files);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  folder="documents"
                  multiple={true}
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  maxSize={10 * 1024 * 1024} // 10MB
                  onUpload={(files) => {
                    console.log('Uploaded documents:', files);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Image Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  folder="images"
                  multiple={true}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  maxSize={5 * 1024 * 1024} // 5MB
                  onUpload={(files) => {
                    console.log('Uploaded images:', files);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AWS S3 Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Region:</strong> {import.meta.env.VITE_AWS_REGION || 'Configured on server'}
              </div>
              <div>
                <strong>Bucket:</strong> {import.meta.env.VITE_AWS_S3_BUCKET_NAME || 'Configured on server'}
              </div>
              <div>
                <strong>Max File Size:</strong> 5MB (configurable)
              </div>
              <div>
                <strong>Supported Types:</strong> Images, PDFs, Documents
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}