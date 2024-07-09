import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { ChatbotUIContext } from "@/context/context"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/browser-client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TOOL_NAME_MAX } from "@/db/limits"

interface CreateprofileProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const Createprofile: FC<CreateprofileProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const [name, setName] = useState(profile?.name || "")
  const [isTyping, setIsTyping] = useState(false)
  const [user_id, setUserId] = useState("")
  const [role, setRole] = useState(profile?.role || "normal") // Default value
  const [organization, setOrganization] = useState(profile?.organization) // Default value

  const [roles, setRoles] = useState([]) // Initialize with empty array
  const [organizations, setorganizations] = useState([]) // Initialize with empty array

  const [loading, setLoading] = useState(true) // Loading state

  useEffect(() => {
    const fetchRoles = async () => {
      // console.log("Fetching roles..."); // Debug log

      const { data, error } = await supabase
        .from("roles") // assuming you want roles from the 'roles' table
        .select("*") // adjust the column names based on your table schema

      if (error) {
        // console.error("Error fetching user roles:", error);
        setLoading(false)
        return
      }

      if (data) {
        // console.log("Roles fetched:", data); // Debug log
        setRoles(data)
        setLoading(false)
      } else {
        // console.log("No data found"); // Debug log
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  useEffect(() => {
    const fetchorganizations = async () => {
      // console.log("Fetching organizations..."); // Debug log

      const { data, error } = await supabase
        .from("organizations") // assuming you want roles from the 'roles' table
        .select("*") // adjust the column names based on your table schema

      if (error) {
        // console.error("Error fetching user organization:", error);
        setLoading(false)
        return
      }

      if (data) {
        // console.log("organization fetched:", data); // Debug log
        setorganizations(data)
        setLoading(false)
      } else {
        // console.log("No data found"); // Debug log
        setLoading(false)
      }
    }

    fetchorganizations()
  }, [])

  const handleOrganizationChange = event => {
    setOrganization(event.target.value)
  }

  const handleRoleChange = event => {
    setRole(event.target.value)
  }

  if (!profile || !selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="profiles"
      createState={
        {
          name,
          role,
          organization
        } as TablesInsert<"profiles">
      }
      isOpen={isOpen}
      isTyping={isTyping}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="User name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={TOOL_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            {loading ? (
              <div>Loading roles...</div>
            ) : roles.length > 0 ? (
              <div className="space-y-1">
                <label htmlFor="userRole">User Role</label>
                <select
                  id="userRole"
                  value={role}
                  onChange={handleRoleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>No roles available</div>
            )}
          </div>

          <div className="space-y-1">
            {loading ? (
              <div>Loading organization...</div>
            ) : organizations.length > 0 ? (
              <div className="space-y-1">
                <label htmlFor="organization">User Role</label>
                <select
                  id="organization"
                  value={organization}
                  onChange={handleOrganizationChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  {organizations.map(organization => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>No organization available</div>
            )}
          </div>
        </>
      )}
      onOpenChange={onOpenChange}
    />
  )
}
